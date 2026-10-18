package com.medora.controller;

import com.medora.model.LeaveRequest;
import com.medora.dao.LeaveRequestDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveRequestDao leaveDao;

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getLeaves() {
        return ResponseEntity.ok(leaveDao.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addLeave(@RequestBody LeaveRequest req) {
        if (req.getDoctorId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "doctorId is required."));
        }
        if (req.getStartDate() == null || req.getEndDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "startDate and endDate are required."));
        }
        try {
            leaveDao.addLeaveRequest(req);
            return ResponseEntity.ok(Map.of("message", "Leave request submitted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit leave request. Please try again."));
        }
    }

    /**
     * Updates the status of a leave request (PENDING → APPROVED or REJECTED).
     * Previously threw IllegalArgumentException which became an unhandled HTTP 500.
     * Now returns a proper 400 / 404 / 200 response.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
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
