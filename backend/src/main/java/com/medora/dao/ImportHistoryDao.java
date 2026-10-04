package com.medora.dao;

import com.medora.model.ImportHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ImportHistoryDao {
    @Autowired
    private DataSource dataSource;

    public void save(ImportHistory history) {
        String sql = "INSERT INTO import_history (filename, imported_by, total_records, imported, updated, skipped, failed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, history.getFilename());
            ps.setString(2, history.getImportedBy());
            ps.setInt(3, history.getTotalRecords() != null ? history.getTotalRecords() : 0);
            ps.setInt(4, history.getImported() != null ? history.getImported() : 0);
            ps.setInt(5, history.getUpdated() != null ? history.getUpdated() : 0);
            ps.setInt(6, history.getSkipped() != null ? history.getSkipped() : 0);
            ps.setInt(7, history.getFailed() != null ? history.getFailed() : 0);
            ps.setString(8, history.getStatus());
            
            ps.executeUpdate();
            
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    history.setId(rs.getLong(1));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB Error saving import history", e);
        }
    }

    public List<ImportHistory> findAll() {
        List<ImportHistory> historyList = new ArrayList<>();
        String sql = "SELECT * FROM import_history ORDER BY date DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
             
            while (rs.next()) {
                ImportHistory h = new ImportHistory();
                h.setId(rs.getLong("id"));
                h.setFilename(rs.getString("filename"));
                h.setImportedBy(rs.getString("imported_by"));
                if (rs.getTimestamp("date") != null) {
                    h.setDate(rs.getTimestamp("date").toLocalDateTime());
                }
                h.setTotalRecords(rs.getInt("total_records"));
                h.setImported(rs.getInt("imported"));
                h.setUpdated(rs.getInt("updated"));
                h.setSkipped(rs.getInt("skipped"));
                h.setFailed(rs.getInt("failed"));
                h.setStatus(rs.getString("status"));
                historyList.add(h);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB Error fetching import history", e);
        }
        return historyList;
    }
}
