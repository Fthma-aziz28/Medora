package com.medora.controller;

import com.medora.model.LeaveRequest;
import com.medora.dao.LeaveRequestDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveRequestDao leaveDao;

    @GetMapping
    public List<LeaveRequest> getLeaves() {
        return leaveDao.findAll();
    }

    @PostMapping
    public void addLeave(@RequestBody LeaveRequest req) {
        leaveDao.addLeaveRequest(req);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }
        leaveDao.updateStatus(id, status);
    }

    @PutMapping("/{id}")
    public void updateLeave(@PathVariable Long id, @RequestBody LeaveRequest req) {
        leaveDao.updateLeave(id, req);
    }

    @DeleteMapping("/{id}")
    public void deleteLeave(@PathVariable Long id) {
        leaveDao.deleteLeave(id);
    }
}
