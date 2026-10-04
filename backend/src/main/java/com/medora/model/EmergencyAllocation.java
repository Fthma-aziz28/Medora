package com.medora.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class EmergencyAllocation {
    private Long id;
    private Long leaveRequestId;
    private Long originalDoctorId;
    private Long replacementDoctorId;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer fairnessScore;
    private String reason;
    private Boolean overrideFlag;
    private Long adminId;
    private LocalDateTime createdAt;
    
    // Additional fields for reporting
    private String originalDoctorName;
    private String replacementDoctorName;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLeaveRequestId() { return leaveRequestId; }
    public void setLeaveRequestId(Long leaveRequestId) { this.leaveRequestId = leaveRequestId; }

    public Long getOriginalDoctorId() { return originalDoctorId; }
    public void setOriginalDoctorId(Long originalDoctorId) { this.originalDoctorId = originalDoctorId; }

    public Long getReplacementDoctorId() { return replacementDoctorId; }
    public void setReplacementDoctorId(Long replacementDoctorId) { this.replacementDoctorId = replacementDoctorId; }

    public LocalDate getSlotDate() { return slotDate; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getFairnessScore() { return fairnessScore; }
    public void setFairnessScore(Integer fairnessScore) { this.fairnessScore = fairnessScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Boolean getOverrideFlag() { return overrideFlag; }
    public void setOverrideFlag(Boolean overrideFlag) { this.overrideFlag = overrideFlag; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getOriginalDoctorName() { return originalDoctorName; }
    public void setOriginalDoctorName(String originalDoctorName) { this.originalDoctorName = originalDoctorName; }

    public String getReplacementDoctorName() { return replacementDoctorName; }
    public void setReplacementDoctorName(String replacementDoctorName) { this.replacementDoctorName = replacementDoctorName; }
}
