package com.medora.controller;

import com.medora.dao.ImportHistoryDao;
import com.medora.model.DoctorImportRequest;
import com.medora.model.ImportHistory;
import com.medora.service.DoctorImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/import")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorImportController {

    @Autowired private DoctorImportService importService;
    @Autowired private ImportHistoryDao importHistoryDao;

    @PostMapping
    public ResponseEntity<ImportHistory> importDoctors(@RequestBody DoctorImportRequest request) {
        // In a real app, you'd get the admin name from SecurityContext
        String adminName = "System Admin";
        ImportHistory history = importService.processImport(request, adminName);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ImportHistory>> getHistory() {
        return ResponseEntity.ok(importHistoryDao.findAll());
    }
}
