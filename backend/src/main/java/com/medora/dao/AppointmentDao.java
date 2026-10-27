package com.medora.dao;

import com.medora.model.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AppointmentDao {

    @Autowired
    private DataSource dataSource;

    private Appointment mapRow(ResultSet rs) throws SQLException {
        Appointment a = new Appointment();
        a.setId(rs.getLong("id"));
        a.setDoctorId(rs.getLong("doctor_id"));
        long pUserId = rs.getLong("patient_user_id");
        if (!rs.wasNull()) {
            a.setPatientUserId(pUserId);
        }
        a.setDoctorName(rs.getString("doctor_name"));
        a.setPatientName(rs.getString("patient_name"));
        a.setIsEmergencyReplacement(rs.getBoolean("is_emergency_replacement"));
        if (rs.getDate("appointment_date") != null) a.setAppointmentDate(rs.getDate("appointment_date").toLocalDate());
        if (rs.getTime("start_time") != null) a.setStartTime(rs.getTime("start_time").toLocalTime());
        if (rs.getTime("end_time") != null) a.setEndTime(rs.getTime("end_time").toLocalTime());
        a.setStatus(rs.getString("status"));
        return a;
    }

    public List<Appointment> findAll() {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT a.*, u.name as doctor_name FROM appointments a " +
                     "JOIN doctors d ON a.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id " +
                     "ORDER BY a.appointment_date, a.start_time";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding all appointments", e);
        }
        return list;
    }

    public List<Appointment> findByDoctorId(Long doctorId) {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT a.*, u.name as doctor_name FROM appointments a " +
                     "JOIN doctors d ON a.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id " +
                     "WHERE a.doctor_id = ? " +
                     "ORDER BY a.appointment_date, a.start_time";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, doctorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding appointments by doctor", e);
        }
        return list;
    }

    public List<Appointment> findByPatientUserId(Long patientUserId, String patientName) {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT a.*, u.name as doctor_name FROM appointments a " +
                     "JOIN doctors d ON a.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id " +
                     "WHERE a.patient_user_id = ? " +
                     "OR (a.patient_user_id IS NULL AND a.patient_name = ?) " +
                     "ORDER BY a.appointment_date, a.start_time";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, patientUserId != null ? patientUserId : -1L);
            ps.setString(2, patientName != null ? patientName : "");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding appointments by patient", e);
        }
        return list;
    }

    public Appointment findById(Long id) {
        String sql = "SELECT a.*, u.name as doctor_name FROM appointments a " +
                     "JOIN doctors d ON a.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id WHERE a.id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding appointment by id", e);
        }
        return null;
    }

    public List<Appointment> findByDoctorIdAndDateRange(Long doctorId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT a.*, u.name as doctor_name FROM appointments a " +
                     "JOIN doctors d ON a.doctor_id = d.id " +
                     "JOIN users u ON d.user_id = u.id " +
                     "WHERE a.doctor_id = ? AND a.appointment_date >= ? AND a.appointment_date <= ? " +
                     "ORDER BY a.appointment_date, a.start_time";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, doctorId);
            ps.setDate(2, Date.valueOf(startDate));
            ps.setDate(3, Date.valueOf(endDate));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding appointments in date range", e);
        }
        return list;
    }

    public void addAppointment(Appointment appt) {
        String sql = "INSERT INTO appointments (doctor_id, patient_user_id, patient_name, appointment_date, start_time, end_time, status, is_emergency_replacement) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, appt.getDoctorId());
            if (appt.getPatientUserId() != null && appt.getPatientUserId() > 0) {
                ps.setLong(2, appt.getPatientUserId());
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            ps.setString(3, appt.getPatientName());
            ps.setDate(4, appt.getAppointmentDate() != null ? Date.valueOf(appt.getAppointmentDate()) : null);
            ps.setTime(5, appt.getStartTime() != null ? Time.valueOf(appt.getStartTime()) : null);
            ps.setTime(6, appt.getEndTime() != null ? Time.valueOf(appt.getEndTime()) : null);
            ps.setString(7, appt.getStatus() != null ? appt.getStatus() : "Confirmed");
            ps.setBoolean(8, appt.getIsEmergencyReplacement() != null && appt.getIsEmergencyReplacement());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    appt.setId(rs.getLong(1));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during addAppointment", e);
        }
    }

    public void updateAppointment(Long id, Appointment appt) {
        String sql = "UPDATE appointments SET doctor_id = ?, patient_user_id = ?, patient_name = ?, appointment_date = ?, " +
                     "start_time = ?, end_time = ?, status = ?, is_emergency_replacement = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, appt.getDoctorId());
            if (appt.getPatientUserId() != null && appt.getPatientUserId() > 0) {
                ps.setLong(2, appt.getPatientUserId());
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            ps.setString(3, appt.getPatientName());
            ps.setDate(4, appt.getAppointmentDate() != null ? Date.valueOf(appt.getAppointmentDate()) : null);
            ps.setTime(5, appt.getStartTime() != null ? Time.valueOf(appt.getStartTime()) : null);
            ps.setTime(6, appt.getEndTime() != null ? Time.valueOf(appt.getEndTime()) : null);
            ps.setString(7, appt.getStatus());
            ps.setBoolean(8, appt.getIsEmergencyReplacement() != null && appt.getIsEmergencyReplacement());
            ps.setLong(9, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error during updateAppointment", e);
        }
    }

    public void deleteAppointment(Long id) {
        String sql = "DELETE FROM appointments WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error during deleteAppointment", e);
        }
    }
}
