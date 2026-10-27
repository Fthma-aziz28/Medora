package com.medora.dao;

import com.medora.model.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class DepartmentDao {

    @Autowired private DataSource dataSource;

    public List<Department> findAll() {
        List<Department> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM departments ORDER BY name ASC");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Department d = new Department();
                d.setId(rs.getLong("id"));
                d.setName(rs.getString("name"));
                list.add(d);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error fetching departments", e);
        }
        return list;
    }

    public Long findOrCreate(String deptName) {
        if (deptName == null || deptName.trim().isEmpty()) {
            deptName = "General Medicine";
        }
        deptName = deptName.trim();

        // 1. Check existing
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement ps = conn.prepareStatement("SELECT id FROM departments WHERE LOWER(name) = LOWER(?)")) {
                ps.setString(1, deptName);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return rs.getLong("id");
                    }
                }
            }

            // 2. Insert new department
            try (PreparedStatement ps = conn.prepareStatement("INSERT INTO departments (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, deptName);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getLong(1);
                    }
                }
            }
        } catch (SQLException e) {
            // If another thread inserted, fetch again
            for (Department d : findAll()) {
                if (d.getName().equalsIgnoreCase(deptName)) {
                    return d.getId();
                }
            }
        }
        return 1L;
    }
}
