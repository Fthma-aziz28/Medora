package com.medora.dao;
import com.medora.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class LeaveRequestDao {
    @Autowired private DataSource dataSource;
    
    public List<LeaveRequest> findAll() {
        List<LeaveRequest> list = new ArrayList<>();
        String sql = "SELECT lr.*, u.name as doctor_name, d.specialty as doctor_specialty " +
                     "FROM leave_requests lr " +
                     "LEFT JOIN doctors d ON lr.doctor_id = d.id " +
                     "LEFT JOIN users u ON d.user_id = u.id " +
                     "ORDER BY lr.start_date DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                LeaveRequest lr = new LeaveRequest();
                lr.setId(rs.getLong("id"));
                lr.setDoctorId(rs.getLong("doctor_id"));
                if(rs.getDate("start_date") != null) lr.setStartDate(rs.getDate("start_date").toLocalDate());
                if(rs.getDate("end_date") != null) lr.setEndDate(rs.getDate("end_date").toLocalDate());
                lr.setReason(rs.getString("reason"));
                lr.setStatus(rs.getString("status"));
                lr.setDoctorName(rs.getString("doctor_name"));
                lr.setDoctorSpecialty(rs.getString("doctor_specialty"));
                list.add(lr);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }

    public void updateStatus(Long id, String status) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("UPDATE leave_requests SET status = ? WHERE id = ?")) {
            ps.setString(1, status != null ? status.toUpperCase() : "PENDING");
            ps.setLong(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
    }

    public void updateLeave(Long id, LeaveRequest request) {
        String sql = "UPDATE leave_requests SET start_date = ?, end_date = ?, reason = ?, status = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, request.getStartDate() != null ? Date.valueOf(request.getStartDate()) : null);
            ps.setDate(2, request.getEndDate() != null ? Date.valueOf(request.getEndDate()) : null);
            ps.setString(3, request.getReason());
            ps.setString(4, request.getStatus() != null ? request.getStatus().toUpperCase() : "PENDING");
            ps.setLong(5, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error updating leave request", e);
        }
    }

    public void deleteLeave(Long id) {
        String sql = "DELETE FROM leave_requests WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error deleting leave request", e);
        }
    }

    public void addLeaveRequest(LeaveRequest request) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("INSERT INTO leave_requests (doctor_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)")) {
            ps.setLong(1, request.getDoctorId());
            ps.setDate(2, request.getStartDate() != null ? Date.valueOf(request.getStartDate()) : null);
            ps.setDate(3, request.getEndDate() != null ? Date.valueOf(request.getEndDate()) : null);
            ps.setString(4, request.getReason());
            ps.setString(5, request.getStatus() != null ? request.getStatus().toUpperCase() : "PENDING");
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error during addLeaveRequest", e);
        }
    }

    public LeaveRequest findById(Long id) {
        String sql = "SELECT lr.*, u.name as doctor_name, d.specialty as doctor_specialty " +
                     "FROM leave_requests lr " +
                     "LEFT JOIN doctors d ON lr.doctor_id = d.id " +
                     "LEFT JOIN users u ON d.user_id = u.id " +
                     "WHERE lr.id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    LeaveRequest lr = new LeaveRequest();
                    lr.setId(rs.getLong("id"));
                    lr.setDoctorId(rs.getLong("doctor_id"));
                    if(rs.getDate("start_date") != null) lr.setStartDate(rs.getDate("start_date").toLocalDate());
                    if(rs.getDate("end_date") != null) lr.setEndDate(rs.getDate("end_date").toLocalDate());
                    lr.setReason(rs.getString("reason"));
                    lr.setStatus(rs.getString("status"));
                    lr.setDoctorName(rs.getString("doctor_name"));
                    lr.setDoctorSpecialty(rs.getString("doctor_specialty"));
                    return lr;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return null;
    }
}
