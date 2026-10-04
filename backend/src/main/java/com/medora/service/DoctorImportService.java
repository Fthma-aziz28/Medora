package com.medora.service;

import com.medora.dao.DepartmentDao;
import com.medora.dao.DoctorDao;
import com.medora.dao.ImportHistoryDao;
import com.medora.dao.UserDao;
import com.medora.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorImportService {

    @Autowired private UserDao userDao;
    @Autowired private DoctorDao doctorDao;
    @Autowired private DepartmentDao departmentDao;
    @Autowired private ImportHistoryDao importHistoryDao;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private DataSource dataSource;

    public ImportHistory processImport(DoctorImportRequest request, String adminName) {
        ImportHistory history = new ImportHistory();
        history.setFilename(request.getFilename());
        history.setImportedBy(adminName);
        history.setDate(LocalDateTime.now());
        history.setTotalRecords(request.getRecords() != null ? request.getRecords().size() : 0);
        
        int imported = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;

        if (request.getRecords() != null) {
            List<Department> departments = departmentDao.findAll();
            
            for (DoctorImportRecord record : request.getRecords()) {
                try {
                    // Find or resolve department
                    Long deptId = departments.stream()
                        .filter(d -> d.getName().equalsIgnoreCase(record.getDepartment()))
                        .map(Department::getId)
                        .findFirst()
                        .orElse(1L); // Fallback to first department (or handle missing)
                    
                    Optional<User> existingUser = userDao.findByEmail(record.getEmail());
                    
                    if (existingUser.isPresent()) {
                        // For simplicity, we just skip existing by email to avoid duplicates in this iteration.
                        // We could also do an UPDATE based on business logic.
                        skipped++;
                    } else {
                        // Create transaction for user and doctor
                        try (Connection conn = dataSource.getConnection()) {
                            conn.setAutoCommit(false);
                            try {
                                long userId;
                                try (PreparedStatement psUser = conn.prepareStatement(
                                        "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'DOCTOR', 'ACTIVE')",
                                        Statement.RETURN_GENERATED_KEYS)) {
                                    psUser.setString(1, record.getFullName());
                                    psUser.setString(2, record.getEmail());
                                    psUser.setString(3, passwordEncoder.encode("Welcome123!")); // Default password
                                    psUser.executeUpdate();
                                    try (ResultSet rs = psUser.getGeneratedKeys()) {
                                        if (rs.next()) {
                                            userId = rs.getLong(1);
                                        } else {
                                            throw new SQLException("Failed to create user");
                                        }
                                    }
                                }

                                try (PreparedStatement psDoc = conn.prepareStatement(
                                        "INSERT INTO doctors (user_id, department_id, specialty, working_days, start_time, end_time, slot_mins) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
                                    psDoc.setLong(1, userId);
                                    psDoc.setLong(2, deptId);
                                    psDoc.setString(3, record.getSpecialization());
                                    psDoc.setString(4, record.getWorkingDays() != null ? record.getWorkingDays() : "Mon,Tue,Wed,Thu,Fri");
                                    psDoc.setString(5, record.getStartTime() != null ? record.getStartTime() : "09:00");
                                    psDoc.setString(6, record.getEndTime() != null ? record.getEndTime() : "17:00");
                                    psDoc.setInt(7, 30); // Default slot mins
                                    psDoc.executeUpdate();
                                }
                                conn.commit();
                                imported++;
                            } catch (SQLException e) {
                                conn.rollback();
                                failed++;
                            } finally {
                                conn.setAutoCommit(true);
                            }
                        }
                    }
                } catch (Exception e) {
                    failed++;
                }
            }
        }

        history.setImported(imported);
        history.setUpdated(updated);
        history.setSkipped(skipped);
        history.setFailed(failed);
        history.setStatus(failed > 0 ? (imported > 0 ? "PARTIAL_SUCCESS" : "FAILED") : "SUCCESS");

        importHistoryDao.save(history);
        return history;
    }
}
