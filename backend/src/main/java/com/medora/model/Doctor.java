package com.medora.model;

public class Doctor {
    private Long id;
    private Long userId;
    private Long departmentId;
    private String specialty;
    private String workingDays;
    private String startTime;
    private String endTime;
    private Integer slotMins;
    private String name;
    private String email;
    private String status;
    private String departmentName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
}
