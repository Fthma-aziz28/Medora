package com.medora.model;

import java.util.List;

public class AllocationAnalysisResponse {
    private Appointment vacantSlot;
    private Doctor originalDoctor;
    private List<CandidateScore> candidates;

    public Appointment getVacantSlot() { return vacantSlot; }
    public void setVacantSlot(Appointment vacantSlot) { this.vacantSlot = vacantSlot; }

    public Doctor getOriginalDoctor() { return originalDoctor; }
    public void setOriginalDoctor(Doctor originalDoctor) { this.originalDoctor = originalDoctor; }

    public List<CandidateScore> getCandidates() { return candidates; }
    public void setCandidates(List<CandidateScore> candidates) { this.candidates = candidates; }
}
