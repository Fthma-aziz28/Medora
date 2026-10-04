package com.medora.service;

import com.medora.dao.AppointmentDao;
import com.medora.dao.DoctorDao;
import com.medora.dao.LeaveRequestDao;
import com.medora.model.Appointment;
import com.medora.model.CandidateScore;
import com.medora.model.Doctor;
import com.medora.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class FairnessEngineService {
    @Autowired private AppointmentDao appointmentDao;
    @Autowired private DoctorDao doctorDao;
    @Autowired private LeaveRequestDao leaveRequestDao;

    public List<CandidateScore> findFairReplacements(Appointment vacantSlot) {
        Doctor originalDoctor = doctorDao.findById(vacantSlot.getDoctorId());
        List<Doctor> departmentDoctors = doctorDao.findByDepartmentId(originalDoctor.getDepartmentId());
        
        List<CandidateScore> candidates = new ArrayList<>();

        for (Doctor candidate : departmentDoctors) {
            if (candidate.getId().equals(originalDoctor.getId())) continue;

            CandidateScore score = evaluateCandidate(candidate, vacantSlot);
            if (score.getEligible()) {
                candidates.add(score);
            }
        }

        // Deterministic Tie-Breaker:
        // 1. Highest Score
        // 2. Lowest Weekly Duty Hours
        // 3. Lowest Recent Emergency Assignments
        // 4. Stable Doctor ID
        candidates.sort(Comparator.comparing(CandidateScore::getFairnessScore).reversed()
            .thenComparing(CandidateScore::getWeeklyDutyHours)
            .thenComparing(CandidateScore::getRecentEmergencyAssignments)
            .thenComparing(CandidateScore::getDoctorId));

        return candidates;
    }

    private CandidateScore evaluateCandidate(Doctor doctor, Appointment vacantSlot) {
        CandidateScore score = new CandidateScore();
        score.setDoctorId(doctor.getId());
        
        // Fetch doctor name
        // (In a real scenario, join with users table. For simplicity here, we assume it's available or set later.
        // I will just set an empty name for now and let the controller populate it)

        // Date boundaries (e.g., this week)
        LocalDate weekStart = vacantSlot.getAppointmentDate().minusDays(vacantSlot.getAppointmentDate().getDayOfWeek().getValue() - 1);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<Appointment> allAppointments = appointmentDao.findByDoctorIdAndDateRange(doctor.getId(), weekStart, weekEnd);

        // --- HARD ELIGIBILITY FILTERS ---
        
        // 1. On Leave?
        List<LeaveRequest> leaves = leaveRequestDao.findAll(); // Optimization: findByDoctorId
        for (LeaveRequest leave : leaves) {
            if (leave.getDoctorId().equals(doctor.getId()) && "APPROVED".equalsIgnoreCase(leave.getStatus())) {
                if (!vacantSlot.getAppointmentDate().isBefore(leave.getStartDate()) && 
                    !vacantSlot.getAppointmentDate().isAfter(leave.getEndDate())) {
                    score.setEligible(false);
                    score.addNegativeFactor("Doctor is on approved leave during this slot.");
                    return score;
                }
            }
        }

        // 2. Conflicting Duty?
        for (Appointment appt : allAppointments) {
            if (appt.getAppointmentDate().equals(vacantSlot.getAppointmentDate())) {
                if (isOverlapping(appt, vacantSlot)) {
                    score.setEligible(false);
                    score.addNegativeFactor("Doctor has a conflicting duty at this time.");
                    return score;
                }
            }
        }

        // --- FAIRNESS SCORING (0 - 100) ---
        int totalScore = 0;
        
        // A. Availability (25%) -> If we passed hard filters, they are available.
        totalScore += 25;
        score.addPositiveFactor("✓ Available for the complete slot.");

        // B. Weekly Workload (20%) -> Less workload = more points. Max 40 hours standard.
        int totalHours = allAppointments.stream()
            .mapToInt(a -> (int) ChronoUnit.HOURS.between(a.getStartTime(), a.getEndTime()))
            .sum();
        score.setWeeklyDutyHours(totalHours);
        
        if (totalHours < 10) { totalScore += 20; score.addPositiveFactor("✓ Very low current weekly workload."); }
        else if (totalHours < 20) { totalScore += 15; score.addPositiveFactor("✓ Low current weekly workload."); }
        else if (totalHours < 30) { totalScore += 10; score.addNegativeFactor("- Moderate weekly workload."); }
        else { score.addNegativeFactor("- High weekly workload."); }

        // C. Recent Workload Count (10%)
        score.setRecentDutyCount(allAppointments.size());
        if (allAppointments.size() < 3) { totalScore += 10; }
        else if (allAppointments.size() < 6) { totalScore += 5; }
        else { score.addNegativeFactor("- High number of recent duties."); }

        // D & E & F. Rest Period, Consecutive Duty, Previous Slot (15% + 15% + 10%)
        boolean consecutive = false;
        boolean previousSlot = false;
        long minRestHours = 999;

        for (Appointment appt : allAppointments) {
            if (appt.getAppointmentDate().equals(vacantSlot.getAppointmentDate())) {
                if (appt.getEndTime().equals(vacantSlot.getStartTime())) {
                    previousSlot = true;
                    consecutive = true;
                }
                if (appt.getStartTime().equals(vacantSlot.getEndTime())) {
                    consecutive = true;
                }
            }
            long rest = ChronoUnit.HOURS.between(appt.getEndTime(), vacantSlot.getStartTime());
            if (rest > 0 && rest < minRestHours) {
                minRestHours = rest;
            }
        }
        score.setWorkedPreviousSlot(previousSlot);
        score.setConsecutiveDuty(consecutive);
        
        if (minRestHours == 999) minRestHours = 24; // No recent duties
        score.setHoursSincePreviousDuty((int) minRestHours);

        if (!previousSlot) {
            totalScore += 10;
            score.addPositiveFactor("✓ Did not work immediately preceding slot.");
        } else {
            score.addNegativeFactor("- Worked immediately preceding slot.");
        }

        if (!consecutive) {
            totalScore += 15;
            score.addPositiveFactor("✓ No consecutive duty assignment.");
        } else {
            score.addNegativeFactor("- Assignment creates consecutive duties.");
        }

        if (minRestHours >= 12) {
            totalScore += 15;
            score.addPositiveFactor("✓ Adequate rest period.");
        } else if (minRestHours >= 8) {
            totalScore += 10;
        } else {
            score.addNegativeFactor("- Shorter rest period than recommended.");
        }

        // G. Recent Emergency Assignments (5%)
        long emergencyCount = allAppointments.stream()
            .filter(a -> a.getIsEmergencyReplacement() != null && a.getIsEmergencyReplacement())
            .count();
        score.setRecentEmergencyAssignments((int) emergencyCount);
        
        if (emergencyCount == 0) {
            totalScore += 5;
            score.addPositiveFactor("✓ No recent emergency assignments.");
        } else {
            score.addNegativeFactor("- Has recently covered emergency assignments.");
        }

        score.setFairnessScore(totalScore);
        return score;
    }

    private boolean isOverlapping(Appointment a1, Appointment a2) {
        return a1.getStartTime().isBefore(a2.getEndTime()) && a2.getStartTime().isBefore(a1.getEndTime());
    }
}
