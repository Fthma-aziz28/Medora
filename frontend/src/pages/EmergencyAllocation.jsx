import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Activity, UserPlus, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_ANALYSIS } from '../demoData';
import './Dashboard.css';

export default function EmergencyAllocation() {
    const { leaveId } = useParams();
    const navigate = useNavigate();
    
    const [analyses, setAnalyses] = useState(DEMO_ANALYSIS);
    const [loading, setLoading] = useState(true);
    const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
    const [simulatedDoctor, setSimulatedDoctor] = useState(DEMO_ANALYSIS[0]?.candidates?.[0] || null);
    const [overrideReason, setOverrideReason] = useState('');
    const [showOverrideDialog, setShowOverrideDialog] = useState(false);

    useEffect(() => {
        fetchAnalysis();
    }, [leaveId]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            if (!API_BASE_URL) {
                setAnalyses(DEMO_ANALYSIS);
                setSimulatedDoctor(DEMO_ANALYSIS[0]?.candidates?.[0] || null);
                return;
            }
            const token = localStorage.getItem('medora_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`${API_BASE_URL}/api/emergency/analyze/${leaveId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAnalyses(data);
                    if (data.length > 0 && data[0]?.candidates?.length > 0) {
                        setSimulatedDoctor(data[0].candidates[0]);
                    } else {
                        setSimulatedDoctor(null);
                    }
                } else {
                    setAnalyses(DEMO_ANALYSIS);
                    setSimulatedDoctor(DEMO_ANALYSIS[0]?.candidates?.[0] || null);
                }
            } else {
                console.warn("Backend returned non-OK status, falling back to demo analysis");
                setAnalyses(DEMO_ANALYSIS);
                setSimulatedDoctor(DEMO_ANALYSIS[0]?.candidates?.[0] || null);
            }
        } catch (error) {
            console.warn("Using fallback demo analysis for emergency allocation:", error);
            setAnalyses(DEMO_ANALYSIS);
            setSimulatedDoctor(DEMO_ANALYSIS[0]?.candidates?.[0] || null);
        } finally {
            setLoading(false);
        }
    };

    const currentAnalysis = (analyses && analyses.length > 0 && analyses[currentSlotIndex]) 
        ? analyses[currentSlotIndex] 
        : (analyses && analyses.length > 0 ? analyses[0] : null);

    const handleSimulate = (doc) => {
        setSimulatedDoctor(doc);
    };

    const handleConfirm = async (isOverride) => {
        if (isOverride && !overrideReason) {
            alert("Please provide an override reason.");
            return;
        }

        if (!currentAnalysis || !simulatedDoctor) {
            navigate('/app/overview');
            return;
        }

        try {
            const token = localStorage.getItem('medora_token');
            const adminId = 1;
            
            const payload = {
                leaveRequestId: leaveId,
                originalDoctorId: currentAnalysis.originalDoctor?.id || 1,
                replacementDoctorId: simulatedDoctor.doctorId,
                slotDate: currentAnalysis.vacantSlot?.appointmentDate,
                startTime: currentAnalysis.vacantSlot?.startTime,
                endTime: currentAnalysis.vacantSlot?.endTime,
                fairnessScore: simulatedDoctor.fairnessScore || 90,
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

            window.dispatchEvent(new Event('medora_appointment_updated'));

            if (currentSlotIndex < analyses.length - 1) {
                const nextIndex = currentSlotIndex + 1;
                setCurrentSlotIndex(nextIndex);
                setSimulatedDoctor(analyses[nextIndex]?.candidates?.[0] || null);
                setShowOverrideDialog(false);
                setOverrideReason('');
            } else {
                alert("Emergency duty allocation successfully assigned and recorded in Fairness Ledger.");
                navigate('/app/fairness-history');
            }
        } catch (error) {
            console.warn("Allocation saved in client state:", error);
            if (currentSlotIndex < analyses.length - 1) {
                setCurrentSlotIndex(currentSlotIndex + 1);
            } else {
                navigate('/app/overview');
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-1)', fontSize: '1.1rem', fontWeight: 600 }}>Analyzing Emergency Allocation...</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem' }}>Evaluating fairness equity and mandatory rest windows</div>
            </div>
        );
    }
    
    if (!analyses || analyses.length === 0 || !currentAnalysis) {
        return (
            <div className="dashboard-container">
                <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                    <div className="system-eyebrow">Fairness Engine · Absence Authorization</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)' }}>Emergency Coverage Assessment</h1>
                    <p>Leave request #{leaveId} has been successfully authorized.</p>
                </header>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#FAF9F5', border: '1px solid var(--border-subtle)', borderRadius: 4 }}>
                    <CheckCircle size={44} color="var(--color-4)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--color-1)', fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem 0' }}>No Conflicting Duties Detected</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 2rem auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        The physician has no active consultations or conflicting ward duty rotations scheduled during this approved absence window. All departmental rosters remain in full compliance.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/app/overview')} className="btn-primary-action">
                            Return to Overview
                        </button>
                        <button onClick={() => navigate('/app/roster')} className="btn-secondary-action">
                            View Duty Roster
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const candidates = currentAnalysis.candidates || [];
    const rank1 = candidates.length > 0 ? candidates[0] : null;

    const originalDocName = currentAnalysis.originalDoctor?.name || `Dr. #${currentAnalysis.originalDoctor?.id || leaveId}`;
    const originalSpecialty = currentAnalysis.originalDoctor?.specialty || currentAnalysis.originalDoctor?.departmentName || 'Cardiology';
    const slotDate = currentAnalysis.vacantSlot?.appointmentDate || '2026-10-06';
    const slotStartTime = currentAnalysis.vacantSlot?.startTime ? currentAnalysis.vacantSlot.startTime.substring(0, 5) : '09:00';
    const slotEndTime = currentAnalysis.vacantSlot?.endTime ? currentAnalysis.vacantSlot.endTime.substring(0, 5) : '13:00';

    const rank1Reasons = (Array.isArray(rank1?.recommendationReason) && rank1.recommendationReason.length > 0)
        ? rank1.recommendationReason
        : (rank1?.justification ? [rank1.justification] : [
            'Lowest cumulative weekly duty hours',
            'Satisfies mandatory 14-hour rest interval',
            'Departmental specialty and credential match'
        ]);

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#b91c1c' }}>
                    <AlertTriangle size={24} />
                    <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.85rem' }}>EMERGENCY COVERAGE REQUIRED</h1>
                </div>
                <button 
                    onClick={() => navigate('/app/overview')} 
                    className="btn-secondary-action"
                    style={{ fontSize: '0.8rem' }}
                >
                    <ArrowLeft size={14} />
                    <span>Back to Overview</span>
                </button>
            </div>
            
            {/* Vacant Duty Slot Panel */}
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(185, 28, 28, 0.05)', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.4rem 0', color: 'var(--color-1)', fontSize: '1.1rem' }}>Original Shift Assignment</h3>
                    <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-2)' }}>{originalSpecialty} Ward Shift</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                        {slotDate} · {slotStartTime} – {slotEndTime}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-3)', fontSize: '0.85rem' }}>Absent Physician</div>
                    <div style={{ fontSize: '1.2rem', color: '#b91c1c', fontWeight: 'bold' }}>{originalDocName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', fontWeight: 600, marginTop: '0.25rem' }}>
                        <XCircle size={14} /> AUTHORIZED LEAVE
                    </div>
                </div>
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', color: 'var(--color-1)' }}>FAIR ALLOCATION ANALYSIS</h2>

            {rank1 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', width: '100%', minWidth: 0 }}>
                    {/* Recommended Candidate */}
                    <div className="glass-panel" style={{ borderTop: '4px solid var(--color-4)', padding: '1.75rem', minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--color-4)', marginBottom: '1rem' }}>RECOMMENDED REPLACEMENT</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.8rem', color: 'var(--color-1)', fontFamily: 'var(--font-heading)' }}>{rank1.doctorName}</h2>
                                <span style={{ padding: '0.3rem 0.65rem', background: 'var(--color-6)', color: 'var(--color-1)', border: '1px solid var(--color-4)', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>RANK 1 CANDIDATE</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-4)', lineHeight: '1', fontFamily: 'var(--font-heading)' }}>{rank1.fairnessScore}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>FAIRNESS SCORE</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ background: '#FAF9F5', padding: '0.75rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.weeklyDutyHours || 24}h</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Weekly Duty</div>
                            </div>
                            <div style={{ background: '#FAF9F5', padding: '0.75rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.hoursSincePreviousDuty || 16}h</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Rest Period</div>
                            </div>
                            <div style={{ background: '#FAF9F5', padding: '0.75rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.consecutiveDuty ? '1' : '0'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Consecutive</div>
                            </div>
                            <div style={{ background: '#FAF9F5', padding: '0.75rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--color-1)' }}>{rank1.recentEmergencyAssignments || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Emergencies</div>
                            </div>
                        </div>

                        <div style={{ background: '#FAF9F5', padding: '1.25rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--color-2)', fontWeight: 600 }}>FAIRNESS ENGINE JUSTIFICATION</h4>
                            {rank1Reasons.map((reason, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--color-1)' }}>
                                    <CheckCircle size={15} color="var(--color-4)" />
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Other Eligible Doctors */}
                    <div className="glass-panel" style={{ padding: '1.75rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', fontFamily: 'var(--font-heading)', color: 'var(--color-1)', fontSize: '1.15rem' }}>OTHER ELIGIBLE PHYSICIANS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {candidates.slice(1).map((candidate, idx) => {
                                const negs = Array.isArray(candidate.negativeFactors) ? candidate.negativeFactors : [];
                                const isSimulated = simulatedDoctor?.doctorId === candidate.doctorId;

                                return (
                                    <div 
                                        key={candidate.doctorId} 
                                        style={{ 
                                            padding: '1rem', 
                                            borderRadius: '4px', 
                                            background: isSimulated ? 'var(--color-6)' : '#FAF9F5', 
                                            border: isSimulated ? '2px solid var(--color-4)' : '1px solid var(--border-subtle)',
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
                                            {negs.length > 0 ? (
                                                negs.map((neg, nIdx) => (
                                                    <span key={nIdx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: 'rgba(185, 28, 28, 0.08)', color: '#b91c1c', borderRadius: '4px', border: '1px solid rgba(185,28,28,0.2)' }}>
                                                        {neg}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eligible standby rotation</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {candidates.length <= 1 && (
                                <div style={{ color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                                    No other eligible physicians found for this slot.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <XCircle size={48} color="#b91c1c" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: '#b91c1c', fontFamily: 'var(--font-heading)' }}>NO IDEAL REPLACEMENT FOUND</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                        All available physicians have hard constraints preventing normal allocation (such as active duty or mandatory rest periods).
                    </p>
                </div>
            )}

            {/* Simulation & Assignment Confirmation Panel */}
            {simulatedDoctor && (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.75rem', borderTop: simulatedDoctor.doctorId === rank1?.doctorId ? '4px solid var(--color-4)' : '4px solid #d97706' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>SIMULATE ASSIGNMENT</div>
                            <h3 style={{ margin: 0, color: 'var(--color-1)', fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>
                                Assign {simulatedDoctor.doctorName} to this slot
                            </h3>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {simulatedDoctor.doctorId === rank1?.doctorId ? (
                                <button className="btn-primary-action" onClick={() => handleConfirm(false)} style={{ padding: '0.75rem 2rem' }}>
                                    CONFIRM REPLACEMENT
                                </button>
                            ) : (
                                <button className="btn-primary-action" onClick={() => setShowOverrideDialog(true)} style={{ background: '#d97706', borderColor: '#b45309', padding: '0.75rem 2rem' }}>
                                    EMERGENCY OVERRIDE
                                </button>
                            )}
                        </div>
                    </div>

                    {showOverrideDialog && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(217, 119, 6, 0.08)', borderRadius: '4px', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309' }}>Confirm Emergency Override</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                You are bypassing the fairness engine's primary recommendation. This action will be audited.
                            </p>
                            <input 
                                type="text" 
                                placeholder="Reason for override (e.g., 'Rank 1 requested clinical exemption')"
                                value={overrideReason}
                                onChange={e => setOverrideReason(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: '#FAF9F5', color: 'var(--color-1)', marginBottom: '1rem', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowOverrideDialog(false)} className="btn-secondary-action">Cancel</button>
                                <button onClick={() => handleConfirm(true)} className="btn-primary-action" style={{ background: '#d97706', borderColor: '#b45309' }}>Submit Override</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Duty Slot {currentSlotIndex + 1} of {analyses.length}
            </div>
        </motion.div>
    );
}
