package com.medora.controller;

import com.medora.model.*;
import com.medora.dao.*;
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
@RequestMapping("/api")
public class CoreDataController {

    @Autowired private DepartmentDao deptDao;
    @Autowired private DoctorDao docDao;
    @Autowired private AppointmentDao apptDao;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ── System Health & Platform State ───────────────────────────────────────────

    @GetMapping("/system/status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            int docCount = docDao.findAll().size();
            int deptCount = deptDao.findAll().size();
            int apptCount = apptDao.findAll().size();
            return ResponseEntity.ok(Map.of(
                "status", "OPERATIONAL",
                "database", "Active Data Store (Connection Pool)",
                "runtime", "Medora Operations Engine",
                "connectionState", "CONNECTED",
                "activeDoctors", docCount,
                "departments", deptCount,
                "appointments", apptCount,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", "DEGRADED",
                "error", e.getMessage()
            ));
        }
    }

    // ── Departments ────────────────────────────────────────────────────────────

    @GetMapping("/departments")
    public List<Department> getDepartments() {
        return deptDao.findAll();
    }

    // ── Doctors ────────────────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() {
        return docDao.findAll();
    }

    /**
     * Returns the doctor record for the currently logged-in doctor.
     * Used by LeaveApplication.jsx to get the correct doctor.id (doctors table PK)
     * rather than using user.id (users table PK), which are different values.
     */
    @GetMapping("/doctors/me")
    public ResponseEntity<?> getMyDoctorProfile() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        Doctor doctor = docDao.findByUserId(currentUser.getId());
        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No doctor profile found for this account."));
        }
        return ResponseEntity.ok(doctor);
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody DoctorDto dto) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Administrative privilege required to onboard doctors."));
        }
        docDao.addDoctor(dto, passwordEncoder);
        return ResponseEntity.ok(Map.of("message", "Doctor onboarded successfully."));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody DoctorDto dto) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Administrative privilege required to edit doctors."));
        }
        docDao.updateDoctor(id, dto);
        return ResponseEntity.ok(Map.of("message", "Doctor updated successfully."));
    }

    @PutMapping("/doctors/{id}/status")
    public ResponseEntity<?> updateDoctorStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Administrative privilege required to change doctor status."));
        }
        String status = body.get("status");
        if (status != null) {
            docDao.updateDoctorStatus(id, status);
        }
        return ResponseEntity.ok(Map.of("message", "Doctor status updated."));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Administrative privilege required to remove doctors."));
        }
        docDao.deleteDoctor(id);
        return ResponseEntity.ok(Map.of("message", "Doctor removed from registry."));
    }

    // ── Appointments ───────────────────────────────────────────────────────────

    /**
     * Retrieves appointments with strict role-based data isolation:
     * - PATIENT: Only appointments where patient_user_id matches authenticated user id (or patient name matches).
     * - DOCTOR: Only appointments assigned to the authenticated doctor's profile.
     * - ADMIN: All hospital appointments.
     * - Unauthenticated: Returns 401 Unauthorized.
     */
    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        if ("PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.ok(apptDao.findByPatientUserId(currentUser.getId(), currentUser.getName()));
        } else if ("DOCTOR".equalsIgnoreCase(currentUser.getRole())) {
            Doctor doc = docDao.findByUserId(currentUser.getId());
            if (doc != null) {
                return ResponseEntity.ok(apptDao.findByDoctorId(doc.getId()));
            }
            return ResponseEntity.ok(List.of());
        } else if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.ok(apptDao.findAll());
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied."));
    }

    /**
     * Returns only the appointments that belong to the currently logged-in patient.
     */
    @GetMapping("/appointments/mine")
    public ResponseEntity<?> getMyAppointments() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        return ResponseEntity.ok(apptDao.findByPatientUserId(currentUser.getId(), currentUser.getName()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> addAppointment(@RequestBody Appointment appt) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        if ("PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            appt.setPatientUserId(currentUser.getId());
            appt.setPatientName(currentUser.getName());
        }
        if (appt.getDoctorId() == null || appt.getDoctorId() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Attending physician is required."));
        }
        if (appt.getAppointmentDate() == null || appt.getStartTime() == null || appt.getEndTime() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Appointment date and shift hours are required."));
        }
        try {
            apptDao.addAppointment(appt);
            return ResponseEntity.ok(Map.of(
                "message", "Appointment successfully scheduled.",
                "id", appt.getId() != null ? appt.getId() : 0
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to persist appointment: " + e.getMessage()));
        }
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment appt) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        Appointment existing = apptDao.findById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Appointment not found."));
        }

        // Authorization check
        if ("PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            boolean isOwner = (existing.getPatientUserId() != null && existing.getPatientUserId().equals(currentUser.getId())) ||
                              (existing.getPatientName() != null && existing.getPatientName().equalsIgnoreCase(currentUser.getName()));
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only update your own appointments."));
            }
            appt.setDoctorId(existing.getDoctorId());
            appt.setPatientUserId(currentUser.getId());
            appt.setPatientName(currentUser.getName());
        } else if ("DOCTOR".equalsIgnoreCase(currentUser.getRole())) {
            Doctor doc = docDao.findByUserId(currentUser.getId());
            if (doc == null || !existing.getDoctorId().equals(doc.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only update appointments assigned to you."));
            }
        }

        try {
            apptDao.updateAppointment(id, appt);
            return ResponseEntity.ok(Map.of("message", "Appointment updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update appointment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        Appointment existing = apptDao.findById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Appointment not found."));
        }

        if ("PATIENT".equalsIgnoreCase(currentUser.getRole())) {
            boolean isOwner = (existing.getPatientUserId() != null && existing.getPatientUserId().equals(currentUser.getId())) ||
                              (existing.getPatientName() != null && existing.getPatientName().equalsIgnoreCase(currentUser.getName()));
            if (!isOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only cancel your own appointments."));
            }
        } else if ("DOCTOR".equalsIgnoreCase(currentUser.getRole())) {
            Doctor doc = docDao.findByUserId(currentUser.getId());
            if (doc == null || !existing.getDoctorId().equals(doc.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only cancel appointments assigned to you."));
            }
        }

        try {
            apptDao.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel appointment: " + e.getMessage()));
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Extracts the authenticated User from the Spring Security context.
     * Returns null if the request is unauthenticated (anonymous / demo token).
     */
    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }
}
