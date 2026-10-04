package com.medora.dao;
import com.medora.model.Doctor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DoctorDao {
    @Autowired private DataSource dataSource;
    public List<Doctor> findAll() {
        List<Doctor> list = new ArrayList<>();
        String sql = "SELECT d.*, u.name, u.email, u.status, dep.name as department_name " +
                     "FROM doctors d " +
                     "LEFT JOIN users u ON d.user_id = u.id " +
                     "LEFT JOIN departments dep ON d.department_id = dep.id";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                Doctor d = new Doctor();
                d.setId(rs.getLong("id"));
                d.setUserId(rs.getLong("user_id"));
                d.setDepartmentId(rs.getLong("department_id"));
                d.setSpecialty(rs.getString("specialty"));
                d.setWorkingDays(rs.getString("working_days"));
                d.setStartTime(rs.getString("start_time"));
                d.setEndTime(rs.getString("end_time"));
                d.setSlotMins(rs.getInt("slot_mins"));
                d.setName(rs.getString("name"));
                d.setEmail(rs.getString("email"));
                d.setStatus(rs.getString("status"));
                d.setDepartmentName(rs.getString("department_name"));
                list.add(d);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }

    public void updateDoctorStatus(Long doctorId, String status) {
        String sql = "UPDATE users u JOIN doctors d ON u.id = d.user_id SET u.status = ? WHERE d.id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setLong(2, doctorId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error updating doctor status", e);
        }
    }

    public void addDoctor(com.medora.model.DoctorDto dto, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // Insert User
                long userId;
                try (PreparedStatement psUser = conn.prepareStatement(
                        "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'DOCTOR', ?)",
                        Statement.RETURN_GENERATED_KEYS)) {
                    psUser.setString(1, dto.getName());
                    psUser.setString(2, dto.getEmail());
                    psUser.setString(3, encoder.encode(dto.getPassword()));
                    // Pass status from dto or default to ACTIVE
                    psUser.setString(4, dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
                    psUser.executeUpdate();
                    try (ResultSet rs = psUser.getGeneratedKeys()) {
                        if (rs.next()) {
                            userId = rs.getLong(1);
                        } else {
                            throw new SQLException("Failed to create user");
                        }
                    }
                }

                // Insert Doctor
                try (PreparedStatement psDoc = conn.prepareStatement(
                        "INSERT INTO doctors (user_id, department_id, specialty, working_days, start_time, end_time, slot_mins) VALUES (?, ?, ?, ?, ?, ?, ?)")) {
                    psDoc.setLong(1, userId);
                    psDoc.setLong(2, dto.getDepartmentId());
                    psDoc.setString(3, dto.getSpecialty());
                    psDoc.setString(4, dto.getWorkingDays());
                    psDoc.setString(5, dto.getStartTime());
                    psDoc.setString(6, dto.getEndTime());
                    psDoc.setInt(7, dto.getSlotMins());
                    psDoc.executeUpdate();
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during addDoctor", e);
        }
    }

    public void updateDoctor(Long id, com.medora.model.DoctorDto dto) {
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement psDoc = conn.prepareStatement(
                    "UPDATE doctors SET department_id = ?, specialty = ?, working_days = ?, start_time = ?, end_time = ?, slot_mins = ? WHERE id = ?")) {
                psDoc.setLong(1, dto.getDepartmentId());
                psDoc.setString(2, dto.getSpecialty());
                psDoc.setString(3, dto.getWorkingDays());
                psDoc.setString(4, dto.getStartTime());
                psDoc.setString(5, dto.getEndTime());
                psDoc.setInt(6, dto.getSlotMins());
                psDoc.setLong(7, id);
                psDoc.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during updateDoctor", e);
        }
    }

    public void deleteDoctor(Long id) {
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement psDoc = conn.prepareStatement(
                    "DELETE FROM doctors WHERE id = ?")) {
                psDoc.setLong(1, id);
                psDoc.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during deleteDoctor", e);
        }
    }

    public List<Doctor> findByDepartmentId(Long departmentId) {
        List<Doctor> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM doctors WHERE department_id = ?")) {
            ps.setLong(1, departmentId);
            try (ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    Doctor d = new Doctor();
                    d.setId(rs.getLong("id"));
                    d.setUserId(rs.getLong("user_id"));
                    d.setDepartmentId(rs.getLong("department_id"));
                    d.setSpecialty(rs.getString("specialty"));
                    d.setWorkingDays(rs.getString("working_days"));
                    d.setStartTime(rs.getString("start_time"));
                    d.setEndTime(rs.getString("end_time"));
                    d.setSlotMins(rs.getInt("slot_mins"));
                    list.add(d);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }

    public Doctor findById(Long id) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM doctors WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Doctor d = new Doctor();
                    d.setId(rs.getLong("id"));
                    d.setUserId(rs.getLong("user_id"));
                    d.setDepartmentId(rs.getLong("department_id"));
                    d.setSpecialty(rs.getString("specialty"));
                    d.setWorkingDays(rs.getString("working_days"));
                    d.setStartTime(rs.getString("start_time"));
                    d.setEndTime(rs.getString("end_time"));
                    d.setSlotMins(rs.getInt("slot_mins"));
                    return d;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return null;
    }
}
