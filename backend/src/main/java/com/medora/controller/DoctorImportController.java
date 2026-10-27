package com.medora.controller;

import com.medora.dao.ImportHistoryDao;
import com.medora.model.DoctorImportRequest;
import com.medora.model.ImportHistory;
import com.medora.model.User;
import com.medora.service.DoctorImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors/import")
public class DoctorImportController {

    @Autowired private DoctorImportService importService;
    @Autowired private ImportHistoryDao importHistoryDao;

    @PostMapping
    public ResponseEntity<?> importDoctors(@RequestBody DoctorImportRequest request) {
        try {
            String adminName = "System Admin";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
                adminName = ((User) auth.getPrincipal()).getName();
            }
            ImportHistory history = importService.processImport(request, adminName);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Import processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ImportHistory>> getHistory() {
        return ResponseEntity.ok(importHistoryDao.findAll());
    }
}
