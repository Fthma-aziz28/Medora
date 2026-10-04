import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Activity, UserPlus, FileText, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_ANALYSIS } from '../demoData';
import './Dashboard.css';

export default function EmergencyAllocation() {
    const { leaveId } = useParams();
    const navigate = useNavigate();
    
    const [analyses, setAnalyses] = useState(DEMO_ANALYSIS);
    const [loading, setLoading] = useState(false);
    const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
    const [simulatedDoctor, setSimulatedDoctor] = useState(DEMO_ANALYSIS[0]?.candidates[0] || null);
    const [overrideReason, setOverrideReason] = useState('');
    const [showOverrideDialog, setShowOverrideDialog] = useState(false);

    useEffect(() => {
        fetchAnalysis();
    }, [leaveId]);

    const fetchAnalysis = async () => {
        try {
            if (!API_BASE_URL) return;
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/emergency/analyze/${leaveId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setAnalyses(data);
                    if (data[0].candidates?.length > 0) {
                        setSimulatedDoctor(data[0].candidates[0]);
                    }
                }
            }
        } catch (error) {
            console.warn("Using fallback demo analysis for mobile/cloud:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentAnalysis = analyses[currentSlotIndex];

    const handleSimulate = (doc) => {
        setSimulatedDoctor(doc);
    };

    const handleConfirm = async (isOverride) => {
        if (isOverride && !overrideReason) {
            alert("Please provide an override reason.");
            return;
        }

        try {
            const token = localStorage.getItem('medora_token');
            const adminId = 1; // Assuming admin ID is 1 for now
            
            const payload = {
                leaveRequestId: leaveId,
                originalDoctorId: currentAnalysis.originalDoctor.id,
                replacementDoctorId: simulatedDoctor.doctorId,
                slotDate: currentAnalysis.vacantSlot.appointmentDate,
                startTime: currentAnalysis.vacantSlot.startTime,
                endTime: currentAnalysis.vacantSlot.endTime,
                fairnessScore: simulatedDoctor.fairnessScore,
                reason: isOverride ? overrideReason : 'Fairness Engine Recommendation',
                overrideFlag: isOverride,
                adminId: adminId
            };

            if (API_BASE_URL) {
                await fetch(`${API_BASE_URL}/api/emergency/confirm`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (currentSlotIndex < analyses.length - 1) {
                setCurrentSlotIndex(currentSlotIndex + 1);
                setSimulatedDoctor(analyses[currentSlotIndex + 1].candidates[0]);
                setShowOverrideDialog(false);
                setOverrideReason('');
            } else {
                navigate('/app/leave');
            }
        } catch (error) {
            console.warn("Allocation saved in client state:", error);
            if (currentSlotIndex < analyses.length - 1) {
                setCurrentSlotIndex(currentSlotIndex + 1);
            } else {
                navigate('/app/leave');
            }
        }
    };

    if (loading) return <div style={{padding: '2rem'}}>Analyzing Emergency Allocation...</div>;
    
    if (analyses.length === 0) {
        return (
            <div className="dashboard-container">
                <header className="page-header">
                    <h1>Emergency Allocation</h1>
                    <p>No conflicting duties found for this leave request. You can safely approve the leave.</p>
                </header>
                <button onClick={() => navigate('/app/leave')} className="action-btn">Return to Leave Management</button>
            </div>
        );
    }

    const rank1 = currentAnalysis.candidates.length > 0 ? currentAnalysis.candidates[0] : null;

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#b91c1c', marginBottom: '1.25rem' }}>
                <AlertTriangle size={24} />
                <h1 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: '2rem' }}>EMERGENCY COVERAGE REQUIRED</h1>
            </div>
            
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(185, 28, 28, 0.06)', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-1)' }}>Original Assignment</h3>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-2)' }}>{currentAnalysis.originalDoctor.specialty}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{currentAnalysis.vacantSlot.appointmentDate} | {currentAnalysis.vacantSlot.startTime} - {currentAnalysis.vacantSlot.endTime}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '500', color: 'var(--color-3)' }}>Original Doctor</div>
                    <div style={{ fontSize: '1.2rem', color: '#b91c1c', fontWeight: 'bold' }}>Dr. {currentAnalysis.originalDoctor.id}</div>
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', fontWeight: 600, marginTop: '0.25rem' }}>
                        <XCircle size={14} /> EMERGENCY LEAVE
                    </div>
                </div>
            </div>

            <h2 style={{ fontFamily: '"Playfair Display", serif', marginBottom: '1.5rem', color: 'var(--color-1)' }}>FAIR ALLOCATION ANALYSIS</h2>

            {rank1 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', width: '100%', minWidth: 0 }}>
                    <div className="glass-panel" style={{ borderTop: '4px solid var(--color-4)', padding: '1.75rem', minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--color-4)', marginBottom: '1rem' }}>RECOMMENDED REPLACEMENT</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.8rem', color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>{rank1.doctorName}</h2>
                                <span style={{ padding: '0.3rem 0.65rem', background: 'var(--color-6)', color: 'var(--color-1)', border: '1px solid var(--color-4)', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>RANK 1</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-4)', lineHeight: '1', fontFamily: '"Playfair Display", serif' }}>{rank1.fairnessScore}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>FAIRNESS SCORE</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.weeklyDutyHours}h</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weekly Duty</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.hoursSincePreviousDuty}h</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rest Period</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.consecutiveDuty ? '1' : '0'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Consecutive</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.recentEmergencyAssignments}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Emergencies</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.45)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--color-2)', fontWeight: 600 }}>WHY THIS DOCTOR?</h4>
                            {rank1.recommendationReason.map((reason, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--color-1)' }}>
                                    <CheckCircle size={15} color="var(--color-4)" /> {reason}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.75rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', fontFamily: '"Playfair Display", serif', color: 'var(--color-1)', fontSize: '1.15rem' }}>OTHER ELIGIBLE DOCTORS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {currentAnalysis.candidates.slice(1).map((candidate, idx) => (
                                <div 
                                    key={candidate.doctorId} 
                                    style={{ 
                                        padding: '1rem', 
                                        borderRadius: '8px', 
                                        background: simulatedDoctor?.doctorId === candidate.doctorId ? 'var(--color-6)' : 'rgba(255,255,255,0.45)', 
                                        border: simulatedDoctor?.doctorId === candidate.doctorId ? '2px solid var(--color-4)' : '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleSimulate(candidate)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--color-1)' }}>
                                            <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>#{idx + 2}</span>
                                            {candidate.doctorName}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-4)' }}>{candidate.fairnessScore}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {candidate.negativeFactors.map((neg, nIdx) => (
                                            <span key={nIdx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: 'rgba(185, 28, 28, 0.08)', color: '#b91c1c', borderRadius: '4px', border: '1px solid rgba(185,28,28,0.2)' }}>
                                                {neg}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {currentAnalysis.candidates.length <= 1 && (
                                <div style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>No other eligible doctors found.</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <XCircle size={48} color="#b91c1c" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: '#b91c1c', fontFamily: '"Playfair Display", serif' }}>NO IDEAL REPLACEMENT FOUND</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                        All available doctors have hard constraints preventing normal allocation (e.g. they are on leave, or already have a conflicting duty).
                    </p>
                </div>
            )}

            {/* SIMULATION PANEL */}
            {simulatedDoctor && (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.75rem', borderTop: simulatedDoctor.doctorId === rank1?.doctorId ? '4px solid var(--color-4)' : '4px solid #d97706' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>SIMULATE ASSIGNMENT</div>
                            <h3 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif', fontSize: '1.35rem' }}>Assign {simulatedDoctor.doctorName} to this slot</h3>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {simulatedDoctor.doctorId === rank1?.doctorId ? (
                                <button className="action-btn" onClick={() => handleConfirm(false)} style={{ background: 'var(--color-4)', color: 'var(--color-beige)', padding: '0.75rem 2rem' }}>
                                    CONFIRM REPLACEMENT
                                </button>
                            ) : (
                                <button className="action-btn" onClick={() => setShowOverrideDialog(true)} style={{ background: '#d97706', color: '#ffffff', padding: '0.75rem 2rem' }}>
                                    EMERGENCY OVERRIDE
                                </button>
                            )}
                        </div>
                    </div>

                    {showOverrideDialog && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(217, 119, 6, 0.08)', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309' }}>Confirm Emergency Override</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                You are bypassing the fairness engine's primary recommendation. This action will be audited.
                            </p>
                            <input 
                                type="text" 
                                placeholder="Reason for override (e.g., 'Rank 1 requested exemption')"
                                value={overrideReason}
                                onChange={e => setOverrideReason(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.9)', color: 'var(--color-1)', marginBottom: '1rem', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowOverrideDialog(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--color-3)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={() => handleConfirm(true)} style={{ padding: '0.5rem 1.25rem', background: '#d97706', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Override</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Slot {currentSlotIndex + 1} of {analyses.length}
            </div>
        </motion.div>
    );
}
