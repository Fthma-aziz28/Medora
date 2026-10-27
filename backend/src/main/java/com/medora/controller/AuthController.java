package com.medora.controller;

import com.medora.dao.DoctorDao;
import com.medora.dao.UserDao;
import com.medora.model.DoctorDto;
import com.medora.model.User;
import com.medora.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserDao userDao;
    @Autowired private DoctorDao doctorDao;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private DataSource dataSource;

    /**
     * Login endpoint for all roles (ADMIN, DOCTOR, PATIENT).
     * Returns a JWT token and sanitized user object (no password hash).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        Optional<User> userOpt = userDao.findByEmail(email.trim().toLowerCase());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean matches = false;
            try {
                matches = passwordEncoder.matches(password, user.getPasswordHash());
            } catch (Exception ignored) {}
            if (!matches && password.equals(user.getPasswordHash())) {
                matches = true;
                userDao.updatePassword(user.getId(), passwordEncoder.encode(password));
            }
            if (matches) {
                String token = jwtUtil.generateToken(user.getEmail());
                return ResponseEntity.ok(Map.of("token", token, "user", sanitize(user)));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password."));
    }

    /**
     * Session validation — called by AuthContext.jsx on every page load.
     * Validates the JWT and returns the authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No token provided."));
        }

        String token = authHeader.substring(7);
        try {
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token."));
            }
            String email = jwtUtil.extractEmail(token);
            Optional<User> userOpt = userDao.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found."));
            }
            return ResponseEntity.ok(sanitize(userOpt.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token validation failed."));
        }
    }

    /**
     * Doctor self-registration (requires admin approval before activation).
     */
    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorDto doctorDto) {
        if (doctorDto.getEmail() == null || doctorDto.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }
        if (userDao.findByEmail(doctorDto.getEmail().trim().toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already in use."));
        }
        doctorDto.setStatus("PENDING_VERIFICATION");
        doctorDao.addDoctor(doctorDto, passwordEncoder);
        return ResponseEntity.ok(Map.of("message", "Registration successful. Pending admin verification."));
    }

    /**
     * Patient self-registration.
     * Creates a PATIENT user account. No admin approval required.
     * On success, returns a JWT token so the patient is immediately logged in.
     */
    @PostMapping("/register-patient")
    public ResponseEntity<?> registerPatient(@RequestBody Map<String, String> body) {
        String name     = body.get("name");
        String email    = body.get("email");
        String password = body.get("password");

        if (name == null || name.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            password == null || password.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Name, email, and password are required."));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters."));
        }

        String cleanEmail = email.trim().toLowerCase();
        if (userDao.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        String sql = "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'PATIENT', 'ACTIVE')";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name.trim());
            ps.setString(2, cleanEmail);
            ps.setString(3, passwordEncoder.encode(password));
            ps.executeUpdate();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed. Please try again."));
        }

        // Auto-login — return a token so patient lands directly in their portal
        Optional<User> created = userDao.findByEmail(cleanEmail);
        if (created.isPresent()) {
            String token = jwtUtil.generateToken(cleanEmail);
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", sanitize(created.get()),
                    "message", "Account created successfully."
            ));
        }
        return ResponseEntity.ok(Map.of("message", "Account created. Please log in."));
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    /** Strips password hash before sending user object to the frontend. */
    private Map<String, Object> sanitize(User user) {
        Map<String, Object> safe = new HashMap<>();
        safe.put("id",     user.getId());
        safe.put("name",   user.getName());
        safe.put("email",  user.getEmail());
        safe.put("role",   user.getRole());
        safe.put("status", user.getStatus());
        return safe;
    }
}
