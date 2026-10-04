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
    @Autowired private DataSource dataSource;
    public List<Appointment> findAll() {
        List<Appointment> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT a.*, u.name as doctor_name FROM appointments a " +
                 "JOIN doctors d ON a.doctor_id = d.id " +
                 "JOIN users u ON d.user_id = u.id");
             ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                Appointment a = new Appointment();
                a.setId(rs.getLong("id"));
                a.setDoctorId(rs.getLong("doctor_id"));
                a.setDoctorName(rs.getString("doctor_name"));
                a.setPatientName(rs.getString("patient_name"));
                a.setIsEmergencyReplacement(rs.getBoolean("is_emergency_replacement"));
                if(rs.getDate("appointment_date") != null) a.setAppointmentDate(rs.getDate("appointment_date").toLocalDate());
                if(rs.getTime("start_time") != null) a.setStartTime(rs.getTime("start_time").toLocalTime());
                if(rs.getTime("end_time") != null) a.setEndTime(rs.getTime("end_time").toLocalTime());
                a.setStatus(rs.getString("status"));
                list.add(a);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }

    public void updateAppointment(Long id, Appointment appt) {
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE appointments SET appointment_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?")) {
                ps.setDate(1, appt.getAppointmentDate() != null ? Date.valueOf(appt.getAppointmentDate()) : null);
                ps.setTime(2, appt.getStartTime() != null ? Time.valueOf(appt.getStartTime()) : null);
                ps.setTime(3, appt.getEndTime() != null ? Time.valueOf(appt.getEndTime()) : null);
                ps.setString(4, appt.getStatus());
                ps.setLong(5, id);
                ps.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during updateAppointment", e);
        }
    }

    public void deleteAppointment(Long id) {
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement("DELETE FROM appointments WHERE id = ?")) {
                ps.setLong(1, id);
                ps.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during deleteAppointment", e);
        }
    }

    public void addAppointment(Appointment appt) {
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO appointments (doctor_id, patient_name, appointment_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)")) {
                ps.setLong(1, appt.getDoctorId());
                ps.setString(2, appt.getPatientName());
                ps.setDate(3, appt.getAppointmentDate() != null ? Date.valueOf(appt.getAppointmentDate()) : null);
                ps.setTime(4, appt.getStartTime() != null ? Time.valueOf(appt.getStartTime()) : null);
                ps.setTime(5, appt.getEndTime() != null ? Time.valueOf(appt.getEndTime()) : null);
                ps.setString(6, appt.getStatus());
                ps.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error during addAppointment", e);
        }
    }

    public Appointment findById(Long id) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT a.*, u.name as doctor_name FROM appointments a " +
                 "JOIN doctors d ON a.doctor_id = d.id " +
                 "JOIN users u ON d.user_id = u.id WHERE a.id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Appointment a = new Appointment();
                    a.setId(rs.getLong("id"));
                    a.setDoctorId(rs.getLong("doctor_id"));
                    a.setDoctorName(rs.getString("doctor_name"));
                    a.setPatientName(rs.getString("patient_name"));
                    a.setIsEmergencyReplacement(rs.getBoolean("is_emergency_replacement"));
                    if(rs.getDate("appointment_date") != null) a.setAppointmentDate(rs.getDate("appointment_date").toLocalDate());
                    if(rs.getTime("start_time") != null) a.setStartTime(rs.getTime("start_time").toLocalTime());
                    if(rs.getTime("end_time") != null) a.setEndTime(rs.getTime("end_time").toLocalTime());
                    a.setStatus(rs.getString("status"));
                    return a;
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return null;
    }

    public List<Appointment> findByDoctorIdAndDateRange(Long doctorId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        List<Appointment> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT a.*, u.name as doctor_name FROM appointments a " +
                 "JOIN doctors d ON a.doctor_id = d.id " +
                 "JOIN users u ON d.user_id = u.id " +
                 "WHERE a.doctor_id = ? AND a.appointment_date >= ? AND a.appointment_date <= ? " +
                 "ORDER BY a.appointment_date, a.start_time")) {
            ps.setLong(1, doctorId);
            ps.setDate(2, Date.valueOf(startDate));
            ps.setDate(3, Date.valueOf(endDate));
            try (ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    Appointment a = new Appointment();
                    a.setId(rs.getLong("id"));
                    a.setDoctorId(rs.getLong("doctor_id"));
                    a.setDoctorName(rs.getString("doctor_name"));
                    a.setPatientName(rs.getString("patient_name"));
                    a.setIsEmergencyReplacement(rs.getBoolean("is_emergency_replacement"));
                    if(rs.getDate("appointment_date") != null) a.setAppointmentDate(rs.getDate("appointment_date").toLocalDate());
                    if(rs.getTime("start_time") != null) a.setStartTime(rs.getTime("start_time").toLocalTime());
                    if(rs.getTime("end_time") != null) a.setEndTime(rs.getTime("end_time").toLocalTime());
                    a.setStatus(rs.getString("status"));
                    list.add(a);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }
}
