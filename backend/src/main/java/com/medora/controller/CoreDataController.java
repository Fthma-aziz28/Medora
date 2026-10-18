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
    @Autowired private PatientDocumentDao docRecordDao;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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
    public void addDoctor(@RequestBody DoctorDto dto) {
        docDao.addDoctor(dto, passwordEncoder);
    }

    @PutMapping("/doctors/{id}")
    public void updateDoctor(@PathVariable Long id, @RequestBody DoctorDto dto) {
        docDao.updateDoctor(id, dto);
    }

    @PutMapping("/doctors/{id}/status")
    public void updateDoctorStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status != null) {
            docDao.updateDoctorStatus(id, status);
        }
    }

    @DeleteMapping("/doctors/{id}")
    public void deleteDoctor(@PathVariable Long id) {
        docDao.deleteDoctor(id);
    }

    // ── Appointments ───────────────────────────────────────────────────────────

    @GetMapping("/appointments")
    public List<Appointment> getAppointments() {
        return apptDao.findAll();
    }

    /**
     * Returns only the appointments that belong to the currently logged-in patient.
     * Requires the patient_user_id column to be populated (via migrate.sql).
     */
    @GetMapping("/appointments/mine")
    public ResponseEntity<?> getMyAppointments() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required."));
        }
        return ResponseEntity.ok(apptDao.findByPatientUserId(currentUser.getId()));
    }

    @PostMapping("/appointments")
    public void addAppointment(@RequestBody Appointment appt) {
        apptDao.addAppointment(appt);
    }

    @PutMapping("/appointments/{id}")
    public void updateAppointment(@PathVariable Long id, @RequestBody Appointment appt) {
        apptDao.updateAppointment(id, appt);
    }

    @DeleteMapping("/appointments/{id}")
    public void deleteAppointment(@PathVariable Long id) {
        apptDao.deleteAppointment(id);
    }

    // ── Patient Documents ──────────────────────────────────────────────────────

    @GetMapping("/documents")
    public List<PatientDocument> getDocuments(@RequestParam String patientEmail) {
        return docRecordDao.findByPatientEmail(patientEmail);
    }

    @PostMapping("/documents")
    public void addDocument(@RequestBody PatientDocument doc) {
        docRecordDao.save(doc);
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
