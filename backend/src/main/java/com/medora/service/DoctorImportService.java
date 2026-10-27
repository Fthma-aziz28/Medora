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
        history.setFilename(request.getFilename() != null ? request.getFilename() : "doctor_import.xlsx");
        history.setImportedBy(adminName != null ? adminName : "System Admin");
        history.setDate(LocalDateTime.now());
        history.setTotalRecords(request.getRecords() != null ? request.getRecords().size() : 0);
        
        int imported = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;

        if (request.getRecords() != null) {
            for (DoctorImportRecord record : request.getRecords()) {
                if (record.getEmail() == null || record.getEmail().trim().isEmpty() ||
                    record.getFullName() == null || record.getFullName().trim().isEmpty()) {
                    failed++;
                    continue;
                }

                String email = record.getEmail().trim().toLowerCase();
                String name = record.getFullName().trim();
                String deptName = record.getDepartment() != null ? record.getDepartment().trim() : "General Medicine";
                Long deptId = departmentDao.findOrCreate(deptName);

                try {
                    Optional<User> existingUserOpt = userDao.findByEmail(email);

                    if (existingUserOpt.isPresent()) {
                        User existingUser = existingUserOpt.get();
                        Doctor existingDoc = doctorDao.findByUserId(existingUser.getId());
                        
                        if (existingDoc != null) {
                            // Update existing doctor profile
                            DoctorDto dto = new DoctorDto();
                            dto.setDepartmentId(deptId);
                            dto.setSpecialty(record.getSpecialization() != null && !record.getSpecialization().isEmpty() 
                                    ? record.getSpecialization().trim() 
                                    : existingDoc.getSpecialty());
                            dto.setWorkingDays(record.getWorkingDays() != null && !record.getWorkingDays().isEmpty() 
                                    ? record.getWorkingDays().trim() 
                                    : existingDoc.getWorkingDays());
                            dto.setStartTime(record.getStartTime() != null && !record.getStartTime().isEmpty() 
                                    ? record.getStartTime().trim() 
                                    : existingDoc.getStartTime());
                            dto.setEndTime(record.getEndTime() != null && !record.getEndTime().isEmpty() 
                                    ? record.getEndTime().trim() 
                                    : existingDoc.getEndTime());
                            dto.setSlotMins(existingDoc.getSlotMins() != null ? existingDoc.getSlotMins() : 20);
                            
                            doctorDao.updateDoctor(existingDoc.getId(), dto);
                            updated++;
                        } else {
                            // User exists but doctor record was missing — attach doctor profile
                            try (Connection conn = dataSource.getConnection()) {
                                try (PreparedStatement psDoc = conn.prepareStatement(
                                        "INSERT INTO doctors (user_id, department_id, specialty, working_days, start_time, end_time, slot_mins) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
                                    psDoc.setLong(1, existingUser.getId());
                                    psDoc.setLong(2, deptId);
                                    psDoc.setString(3, record.getSpecialization() != null ? record.getSpecialization().trim() : "General Practice");
                                    psDoc.setString(4, record.getWorkingDays() != null ? record.getWorkingDays().trim() : "Mon,Tue,Wed,Thu,Fri");
                                    psDoc.setString(5, record.getStartTime() != null ? record.getStartTime().trim() : "09:00");
                                    psDoc.setString(6, record.getEndTime() != null ? record.getEndTime().trim() : "17:00");
                                    psDoc.setInt(7, 20);
                                    psDoc.executeUpdate();
                                }
                            }
                            updated++;
                        }
                    } else {
                        // Create user + doctor in atomic transaction
                        try (Connection conn = dataSource.getConnection()) {
                            conn.setAutoCommit(false);
                            try {
                                long userId;
                                try (PreparedStatement psUser = conn.prepareStatement(
                                        "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'DOCTOR', 'ACTIVE')",
                                        Statement.RETURN_GENERATED_KEYS)) {
                                    psUser.setString(1, name);
                                    psUser.setString(2, email);
                                    psUser.setString(3, passwordEncoder.encode("Welcome123!"));
                                    psUser.executeUpdate();
                                    try (ResultSet rs = psUser.getGeneratedKeys()) {
                                        if (rs.next()) {
                                            userId = rs.getLong(1);
                                        } else {
                                            throw new SQLException("Failed to create user record");
                                        }
                                    }
                                }

                                try (PreparedStatement psDoc = conn.prepareStatement(
                                        "INSERT INTO doctors (user_id, department_id, specialty, working_days, start_time, end_time, slot_mins) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
                                    psDoc.setLong(1, userId);
                                    psDoc.setLong(2, deptId);
                                    psDoc.setString(3, record.getSpecialization() != null ? record.getSpecialization().trim() : "General Medicine");
                                    psDoc.setString(4, record.getWorkingDays() != null ? record.getWorkingDays().trim() : "Mon,Tue,Wed,Thu,Fri");
                                    psDoc.setString(5, record.getStartTime() != null ? record.getStartTime().trim() : "09:00");
                                    psDoc.setString(6, record.getEndTime() != null ? record.getEndTime().trim() : "17:00");
                                    psDoc.setInt(7, 20);
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
        history.setStatus(failed > 0 ? (imported > 0 || updated > 0 ? "PARTIAL_SUCCESS" : "FAILED") : "SUCCESS");

        try {
            importHistoryDao.save(history);
        } catch (Exception e) {
            System.err.println("Failed to log import history: " + e.getMessage());
        }
        return history;
    }
}
