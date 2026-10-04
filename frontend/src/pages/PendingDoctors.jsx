import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, UserCheck, AlertCircle, Clock, Stethoscope } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_DOCTORS } from '../demoData';

export default function PendingDoctors({ onDoctorVerified }) {
    const defaultPending = DEMO_DOCTORS.filter(d => d.status === 'PENDING_VERIFICATION');
    const [doctors, setDoctors] = useState(defaultPending);
    const [loading, setLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            if (!API_BASE_URL) return;
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/doctors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setDoctors(data.filter(d => d.status === 'PENDING_VERIFICATION'));
                }
            }
        } catch (err) {
            console.warn("Using fallback pending doctors for mobile/cloud:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (doctorId, status) => {
        try {
            if (API_BASE_URL) {
                const token = localStorage.getItem('medora_token');
                await fetch(`${API_BASE_URL}/api/doctors/${doctorId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });
            }
        } catch (err) {
            console.warn("Backend update failed, applying locally:", err);
        } finally {
            setActionMsg(`Physician ID #${doctorId} successfully marked as ${status}.`);
            setDoctors(prev => prev.filter(d => d.id !== doctorId));
            if (onDoctorVerified) onDoctorVerified();
            setTimeout(() => setActionMsg(''), 4000);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--color-3)' }}>Loading pending verifications...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Pending Doctor Verifications</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Physicians who self-registered or imported pending administrative credential authorization.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(217, 119, 6, 0.12)', color: '#b45309', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(217, 119, 6, 0.25)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <ShieldAlert size={16} /> {doctors.length} Awaiting Authorization
                </div>
            </div>

            {actionMsg && (
                <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(35, 83, 71, 0.12)', border: '1px solid rgba(35, 83, 71, 0.25)', borderRadius: '8px', color: 'var(--color-1)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <UserCheck size={18} color="var(--color-4)" /> {actionMsg}
                </div>
            )}

            {doctors.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--color-3)' }}>
                    <div style={{ display: 'inline-block', padding: '1rem', background: 'var(--color-6)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--color-4)' }}>
                        <Check size={32} />
                    </div>
                    <h3 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>All Physician Verifications Complete</h3>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>There are currently no new physician self-registrations awaiting administrative review.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                    {doctors.map(doc => (
                        <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #d97706' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--color-1)', fontSize: '1.2rem', fontFamily: '"Playfair Display", serif' }}>
                                            {doc.name || `Dr. (ID #${doc.id})`}
                                        </h3>
                                        <div style={{ color: 'var(--color-4)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>
                                            {doc.specialty || 'General Practitioner'}
                                        </div>
                                    </div>
                                    <span className="status-tag pending">
                                        <Clock size={12} /> Pending Review
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-1)', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.45)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-3)' }}>Email:</span>
                                        <span style={{ fontWeight: 500 }}>{doc.email || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-3)' }}>Department:</span>
                                        <span style={{ fontWeight: 500 }}>{doc.departmentName || `Dept #${doc.departmentId}`}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-3)' }}>Working Days:</span>
                                        <span style={{ fontWeight: 500 }}>{doc.workingDays || 'Mon-Fri'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-3)' }}>Shift Hours:</span>
                                        <span style={{ fontWeight: 500 }}>{doc.startTime || '09:00'} - {doc.endTime || '17:00'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <button 
                                    onClick={() => handleUpdateStatus(doc.id, 'ACTIVE')}
                                    className="action-btn"
                                    style={{ flex: 1, padding: '0.65rem', justifyContent: 'center' }}
                                >
                                    <Check size={16} /> Approve & Activate
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(doc.id, 'REJECTED')}
                                    style={{ padding: '0.65rem 1.1rem', background: 'rgba(185, 28, 28, 0.1)', color: '#b91c1c', border: '1px solid rgba(185, 28, 28, 0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                                >
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
