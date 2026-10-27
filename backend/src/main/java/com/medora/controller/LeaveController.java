package com.medora.controller;

import com.medora.model.LeaveRequest;
import com.medora.dao.LeaveRequestDao;
import com.medora.dao.DoctorDao;
import com.medora.model.Doctor;
import com.medora.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveRequestDao leaveDao;

    @Autowired
    private DoctorDao docDao;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getLeaves() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Doctor doc = docDao.findByUserId(user.getId());
            if (doc != null) {
                return ResponseEntity.ok(leaveDao.findByDoctorId(doc.getId()));
            }
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(leaveDao.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addLeave(@RequestBody LeaveRequest req) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }

        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            Doctor doc = docDao.findByUserId(user.getId());
            if (doc != null) {
                req.setDoctorId(doc.getId());
            }
        }

        if (req.getDoctorId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "doctorId is required."));
        }
        if (req.getStartDate() == null || req.getEndDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "startDate and endDate are required."));
        }
        try {
            Long id = leaveDao.addLeaveRequest(req);
            req.setId(id);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit leave request. Please try again."));
        }
    }

    /**
     * Updates the status of a leave request (PENDING -> APPROVED or REJECTED).
     * Only administrators are permitted to authorize or decline physician leaves.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only hospital administrators can authorize or decline absence requests."));
        }
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "status field is required (APPROVED or REJECTED)."));
        }

        String normalised = status.trim().toUpperCase();
        if (!normalised.equals("APPROVED") && !normalised.equals("REJECTED") && !normalised.equals("PENDING")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status. Must be APPROVED, REJECTED, or PENDING."));
        }

        try {
            leaveDao.updateStatus(id, normalised);
            return ResponseEntity.ok(Map.of("message", "Leave status updated to " + normalised + "."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update leave status. Please try again."));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeave(@PathVariable Long id,
                                         @RequestBody LeaveRequest req) {
        try {
            leaveDao.updateLeave(id, req);
            return ResponseEntity.ok(Map.of("message", "Leave request updated."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update leave request."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        try {
            leaveDao.deleteLeave(id);
            return ResponseEntity.ok(Map.of("message", "Leave request deleted."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete leave request."));
        }
    }
}
