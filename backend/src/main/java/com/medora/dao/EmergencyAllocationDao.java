package com.medora.dao;

import com.medora.model.EmergencyAllocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class EmergencyAllocationDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private RowMapper<EmergencyAllocation> rowMapper = new RowMapper<EmergencyAllocation>() {
        @Override
        public EmergencyAllocation mapRow(ResultSet rs, int rowNum) throws SQLException {
            EmergencyAllocation allocation = new EmergencyAllocation();
            allocation.setId(rs.getLong("id"));
            allocation.setLeaveRequestId(rs.getLong("leave_request_id"));
            allocation.setOriginalDoctorId(rs.getLong("original_doctor_id"));
            allocation.setReplacementDoctorId(rs.getLong("replacement_doctor_id"));
            allocation.setSlotDate(rs.getDate("slot_date").toLocalDate());
            allocation.setStartTime(rs.getTime("start_time").toLocalTime());
            allocation.setEndTime(rs.getTime("end_time").toLocalTime());
            allocation.setFairnessScore(rs.getInt("fairness_score"));
            allocation.setReason(rs.getString("reason"));
            allocation.setOverrideFlag(rs.getBoolean("override_flag"));
            allocation.setAdminId(rs.getLong("admin_id"));
            if (rs.getTimestamp("created_at") != null) {
                allocation.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            
            try {
                allocation.setOriginalDoctorName(rs.getString("original_doctor_name"));
                allocation.setReplacementDoctorName(rs.getString("replacement_doctor_name"));
            } catch (SQLException e) {
                // Ignore if not present in query
            }
            return allocation;
        }
    };

    public void save(EmergencyAllocation allocation) {
        String sql = "INSERT INTO emergency_allocations (leave_request_id, original_doctor_id, replacement_doctor_id, slot_date, start_time, end_time, fairness_score, reason, override_flag, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                allocation.getLeaveRequestId(),
                allocation.getOriginalDoctorId(),
                allocation.getReplacementDoctorId(),
                allocation.getSlotDate(),
                allocation.getStartTime(),
                allocation.getEndTime(),
                allocation.getFairnessScore(),
                allocation.getReason(),
                allocation.getOverrideFlag(),
                allocation.getAdminId());
    }

    public List<EmergencyAllocation> findAllWithDoctorNames() {
        String sql = "SELECT ea.*, " +
                     "(SELECT name FROM users u JOIN doctors d ON u.id = d.user_id WHERE d.id = ea.original_doctor_id) as original_doctor_name, " +
                     "(SELECT name FROM users u JOIN doctors d ON u.id = d.user_id WHERE d.id = ea.replacement_doctor_id) as replacement_doctor_name " +
                     "FROM emergency_allocations ea " +
                     "ORDER BY ea.created_at DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }
}
