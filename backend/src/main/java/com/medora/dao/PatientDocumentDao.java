package com.medora.dao;

import com.medora.model.PatientDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PatientDocumentDao {
    @Autowired private DataSource dataSource;

    private PatientDocument mapRow(ResultSet rs) throws SQLException {
        PatientDocument d = new PatientDocument();
        d.setId(rs.getLong("id"));
        d.setPatientEmail(rs.getString("patient_email"));
        long pUserId = rs.getLong("patient_user_id");
        if (!rs.wasNull()) d.setPatientUserId(pUserId);
        d.setDocumentType(rs.getString("document_type"));
        d.setTitle(rs.getString("title"));
        d.setDescription(rs.getString("description"));
        d.setFileUrl(rs.getString("file_url"));
        d.setFilePath(rs.getString("file_path"));
        d.setFileName(rs.getString("file_name"));
        long size = rs.getLong("file_size");
        if (!rs.wasNull()) d.setFileSize(size);
        d.setContentType(rs.getString("content_type"));
        long uploader = rs.getLong("uploaded_by_user_id");
        if (!rs.wasNull()) d.setUploadedByUserId(uploader);
        if (rs.getTimestamp("created_at") != null) {
            d.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        }
        return d;
    }

    public PatientDocument findById(Long id) {
        String sql = "SELECT * FROM patient_documents WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding document by id", e);
        }
        return null;
    }

    public List<PatientDocument> findByPatientEmail(String email) {
        List<PatientDocument> list = new ArrayList<>();
        String sql = "SELECT * FROM patient_documents WHERE patient_email = ? ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding documents by email", e);
        }
        return list;
    }

    public List<PatientDocument> findByPatientUserIdOrEmail(Long userId, String email) {
        List<PatientDocument> list = new ArrayList<>();
        String sql = "SELECT * FROM patient_documents WHERE (patient_user_id = ? OR patient_email = ?) ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId != null ? userId : -1L);
            ps.setString(2, email != null ? email : "");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding documents for patient", e);
        }
        return list;
    }

    public List<PatientDocument> findAll() {
        List<PatientDocument> list = new ArrayList<>();
        String sql = "SELECT * FROM patient_documents ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding all documents", e);
        }
        return list;
    }

    public void save(PatientDocument doc) {
        String sql = "INSERT INTO patient_documents " +
                     "(patient_email, patient_user_id, document_type, title, description, file_url, file_path, file_name, file_size, content_type, uploaded_by_user_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, doc.getPatientEmail());
            if (doc.getPatientUserId() != null) ps.setLong(2, doc.getPatientUserId());
            else ps.setNull(2, Types.BIGINT);
            ps.setString(3, doc.getDocumentType());
            ps.setString(4, doc.getTitle());
            ps.setString(5, doc.getDescription());
            ps.setString(6, doc.getFileUrl());
            ps.setString(7, doc.getFilePath());
            ps.setString(8, doc.getFileName());
            if (doc.getFileSize() != null) ps.setLong(9, doc.getFileSize());
            else ps.setNull(9, Types.BIGINT);
            ps.setString(10, doc.getContentType());
            if (doc.getUploadedByUserId() != null) ps.setLong(11, doc.getUploadedByUserId());
            else ps.setNull(11, Types.BIGINT);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    doc.setId(rs.getLong(1));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error saving document", e);
        }
    }
}
