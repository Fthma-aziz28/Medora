package com.medora.controller;

import com.medora.model.*;
import com.medora.dao.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
public class CoreDataController {
    
    @Autowired private DepartmentDao deptDao;
    @Autowired private DoctorDao docDao;
    @Autowired private AppointmentDao apptDao;
    @Autowired private PatientDocumentDao docRecordDao;

    @GetMapping("/departments")
    public List<Department> getDepartments() { return deptDao.findAll(); }

    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/doctors")
    public List<Doctor> getDoctors() { return docDao.findAll(); }

    @PostMapping("/doctors")
    public void addDoctor(@RequestBody DoctorDto dto) {
        docDao.addDoctor(dto, passwordEncoder);
    }

    @PutMapping("/doctors/{id}")
    public void updateDoctor(@PathVariable Long id, @RequestBody DoctorDto dto) {
        docDao.updateDoctor(id, dto);
    }

    @PutMapping("/doctors/{id}/status")
    public void updateDoctorStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status != null) {
            docDao.updateDoctorStatus(id, status);
        }
    }

    @DeleteMapping("/doctors/{id}")
    public void deleteDoctor(@PathVariable Long id) {
        docDao.deleteDoctor(id);
    }

    @GetMapping("/appointments")
    public List<Appointment> getAppointments() { return apptDao.findAll(); }

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

    @GetMapping("/documents")
    public List<PatientDocument> getDocuments(@RequestParam String patientEmail) {
        return docRecordDao.findByPatientEmail(patientEmail);
    }

    @PostMapping("/documents")
    public void addDocument(@RequestBody PatientDocument doc) {
        docRecordDao.save(doc);
    }
}
