package com.medora.controller;

import com.medora.dao.AppointmentDao;
import com.medora.dao.DoctorDao;
import com.medora.dao.EmergencyAllocationDao;
import com.medora.dao.LeaveRequestDao;
import com.medora.model.*;
import com.medora.service.FairnessEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "http://localhost:5173")
public class EmergencyAllocationController {

    @Autowired private FairnessEngineService fairnessEngine;
    @Autowired private LeaveRequestDao leaveRequestDao;
    @Autowired private AppointmentDao appointmentDao;
    @Autowired private DoctorDao doctorDao;
    @Autowired private EmergencyAllocationDao emergencyAllocationDao;

    @GetMapping("/analyze/{leaveId}")
    public ResponseEntity<List<AllocationAnalysisResponse>> analyzeLeave(@PathVariable Long leaveId) {
        LeaveRequest leave = leaveRequestDao.findById(leaveId);
        if (leave == null) return ResponseEntity.notFound().build();

        // Find appointments that overlap with this leave
        List<Appointment> allAppointments = appointmentDao.findAll();
        List<Appointment> conflictingAppointments = allAppointments.stream()
            .filter(a -> a.getDoctorId().equals(leave.getDoctorId()))
            .filter(a -> !a.getAppointmentDate().isBefore(leave.getStartDate()) && !a.getAppointmentDate().isAfter(leave.getEndDate()))
            .collect(Collectors.toList());

        List<AllocationAnalysisResponse> responses = new ArrayList<>();
        Doctor originalDoctor = doctorDao.findById(leave.getDoctorId());

        for (Appointment vacantSlot : conflictingAppointments) {
            AllocationAnalysisResponse response = new AllocationAnalysisResponse();
            response.setVacantSlot(vacantSlot);
            response.setOriginalDoctor(originalDoctor);

            List<CandidateScore> candidates = fairnessEngine.findFairReplacements(vacantSlot);
            
            // Populate names cleanly from allDocs
            List<Doctor> allDocs = doctorDao.findAll();
            for (CandidateScore c : candidates) {
                String docName = allDocs.stream()
                    .filter(doc -> doc.getId().equals(c.getDoctorId()))
                    .map(Doctor::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .findFirst()
                    .orElse("Dr. " + c.getDoctorId());
                c.setDoctorName(docName);
            }

            response.setCandidates(candidates);
            responses.add(response);
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmAllocation(@RequestBody EmergencyAllocation allocation) {
        // Find the appointment and update it
        List<Appointment> allAppointments = appointmentDao.findAll();
        Appointment targetAppt = allAppointments.stream()
            .filter(a -> a.getDoctorId().equals(allocation.getOriginalDoctorId()) && a.getAppointmentDate().equals(allocation.getSlotDate()) && a.getStartTime().equals(allocation.getStartTime()))
            .findFirst().orElse(null);

        if (targetAppt != null) {
            // FINAL CONFIRMATION RECHECK
            List<CandidateScore> freshCandidates = fairnessEngine.findFairReplacements(targetAppt);
            boolean stillEligible = freshCandidates.stream().anyMatch(c -> c.getDoctorId().equals(allocation.getReplacementDoctorId()));
            
            if (!stillEligible) {
                return ResponseEntity.status(409).body("Doctor availability has changed. Please review the updated candidates.");
            }

            targetAppt.setDoctorId(allocation.getReplacementDoctorId());
            targetAppt.setIsEmergencyReplacement(true);
            appointmentDao.updateAppointment(targetAppt.getId(), targetAppt);
        }

        emergencyAllocationDao.save(allocation);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmergencyAllocation>> getHistory() {
        return ResponseEntity.ok(emergencyAllocationDao.findAllWithDoctorNames());
    }
}
