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

    public List<PatientDocument> findByPatientEmail(String email) {
        List<PatientDocument> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM patient_documents WHERE patient_email = ? ORDER BY created_at DESC")) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    PatientDocument d = new PatientDocument();
                    d.setId(rs.getLong("id"));
                    d.setPatientEmail(rs.getString("patient_email"));
                    d.setDocumentType(rs.getString("document_type"));
                    d.setTitle(rs.getString("title"));
                    d.setDescription(rs.getString("description"));
                    d.setFileUrl(rs.getString("file_url"));
                    if(rs.getTimestamp("created_at") != null) {
                        d.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    }
                    list.add(d);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error finding documents", e);
        }
        return list;
    }

    public void save(PatientDocument doc) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "INSERT INTO patient_documents (patient_email, document_type, title, description, file_url) VALUES (?, ?, ?, ?, ?)")) {
            ps.setString(1, doc.getPatientEmail());
            ps.setString(2, doc.getDocumentType());
            ps.setString(3, doc.getTitle());
            ps.setString(4, doc.getDescription());
            ps.setString(5, doc.getFileUrl());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("DB error saving document", e);
        }
    }
}
