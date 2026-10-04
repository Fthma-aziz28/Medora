package com.medora.model;

import java.util.List;
import java.util.ArrayList;

public class CandidateScore {
    private Long doctorId;
    private String doctorName;
    private Integer fairnessScore;
    
    // Metrics
    private Integer weeklyDutyHours = 0;
    private Integer recentDutyCount = 0;
    private Integer hoursSincePreviousDuty = 0;
    private Boolean consecutiveDuty = false;
    private Boolean workedPreviousSlot = false;
    private Integer recentEmergencyAssignments = 0;
    private Boolean eligible = true;
    
    private List<String> recommendationReason = new ArrayList<>();
    private List<String> negativeFactors = new ArrayList<>();

    // Getters and Setters
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public Integer getFairnessScore() { return fairnessScore; }
    public void setFairnessScore(Integer fairnessScore) { this.fairnessScore = fairnessScore; }

    public Integer getWeeklyDutyHours() { return weeklyDutyHours; }
    public void setWeeklyDutyHours(Integer weeklyDutyHours) { this.weeklyDutyHours = weeklyDutyHours; }

    public Integer getRecentDutyCount() { return recentDutyCount; }
    public void setRecentDutyCount(Integer recentDutyCount) { this.recentDutyCount = recentDutyCount; }

    public Integer getHoursSincePreviousDuty() { return hoursSincePreviousDuty; }
    public void setHoursSincePreviousDuty(Integer hoursSincePreviousDuty) { this.hoursSincePreviousDuty = hoursSincePreviousDuty; }

    public Boolean getConsecutiveDuty() { return consecutiveDuty; }
    public void setConsecutiveDuty(Boolean consecutiveDuty) { this.consecutiveDuty = consecutiveDuty; }

    public Boolean getWorkedPreviousSlot() { return workedPreviousSlot; }
    public void setWorkedPreviousSlot(Boolean workedPreviousSlot) { this.workedPreviousSlot = workedPreviousSlot; }

    public Integer getRecentEmergencyAssignments() { return recentEmergencyAssignments; }
    public void setRecentEmergencyAssignments(Integer recentEmergencyAssignments) { this.recentEmergencyAssignments = recentEmergencyAssignments; }

    public Boolean getEligible() { return eligible; }
    public void setEligible(Boolean eligible) { this.eligible = eligible; }

    public List<String> getRecommendationReason() { return recommendationReason; }
    public void setRecommendationReason(List<String> recommendationReason) { this.recommendationReason = recommendationReason; }

    public List<String> getNegativeFactors() { return negativeFactors; }
    public void setNegativeFactors(List<String> negativeFactors) { this.negativeFactors = negativeFactors; }
    
    public void addPositiveFactor(String factor) {
        this.recommendationReason.add(factor);
    }
    
    public void addNegativeFactor(String factor) {
        this.negativeFactors.add(factor);
    }
}
