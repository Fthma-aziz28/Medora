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
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM departments");
             ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                Department d = new Department();
                d.setId(rs.getLong("id"));
                d.setName(rs.getString("name"));
                list.add(d);
            }
        } catch (SQLException e) {
            throw new RuntimeException("DB error", e);
        }
        return list;
    }
}
