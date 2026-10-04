package com.medora.model;

public class DoctorDto {
    private String name;
    private String email;
    private String password;
    private Long departmentId;
    private String specialty;
    private String workingDays;
    private String startTime;
    private String endTime;
    private Integer slotMins;
    private String status;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public Integer getSlotMins() { return slotMins; }
    public void setSlotMins(Integer slotMins) { this.slotMins = slotMins; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
