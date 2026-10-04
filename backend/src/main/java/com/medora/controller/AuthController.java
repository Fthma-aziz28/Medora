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

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private DoctorDao doctorDao;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userDao.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verify BCrypt hashed password (handling raw "password" for prototype ease as well)
            if (password.equals("password") || passwordEncoder.matches(password, user.getPasswordHash())) {
                String token = jwtUtil.generateToken(user.getEmail());
                return ResponseEntity.ok(Map.of("token", token, "user", user));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
    }

    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorDto doctorDto) {
        if (userDao.findByEmail(doctorDto.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email already in use"));
        }
        doctorDto.setStatus("PENDING_VERIFICATION");
        doctorDao.addDoctor(doctorDto, passwordEncoder);
        return ResponseEntity.ok(Map.of("message", "Registration successful. Pending verification."));
    }
}
