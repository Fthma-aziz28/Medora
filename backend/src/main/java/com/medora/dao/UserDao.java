package com.medora.dao;

import com.medora.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

@Repository
public class UserDao {
    @Autowired
    private DataSource dataSource;

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    User user = new User();
                    user.setId(rs.getLong("id"));
                    user.setName(rs.getString("name"));
                    user.setEmail(rs.getString("email"));
                    user.setPasswordHash(rs.getString("password_hash"));
                    user.setRole(rs.getString("role"));
                    user.setStatus(rs.getString("status"));
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Database connection error", e);
        }
        return Optional.empty();
    }
}
