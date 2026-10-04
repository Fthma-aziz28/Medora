package com.medora.model;
import java.time.LocalDate;
import java.time.LocalTime;

public class Appointment {
    private Long id;
    private Long doctorId;
    private String patientName;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String doctorName;
    private Boolean isEmergencyReplacement = false;

    public Boolean getIsEmergencyReplacement() { return isEmergencyReplacement; }
    public void setIsEmergencyReplacement(Boolean isEmergencyReplacement) { this.isEmergencyReplacement = isEmergencyReplacement; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
