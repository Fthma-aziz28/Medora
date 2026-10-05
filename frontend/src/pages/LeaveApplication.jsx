import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_LEAVES } from '../demoData';
import './Dashboard.css';

export default function LeaveApplication() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState(DEMO_LEAVES);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        doctorId: user?.id || 1,
        doctorName: user?.name || 'Dr. Aisha Rahman',
        doctorSpecialty: 'Cardiology',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            if (!API_BASE_URL) return;
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) setLeaves(data);
            }
        } catch (err) {
            console.warn("Using fallback leaves for mobile/cloud:", err);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newLeave = {
            id: Date.now(),
            doctorId: user?.id || 1,
            doctorName: user?.name || 'Dr. Aisha Rahman',
            doctorSpecialty: 'Cardiology',
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason,
            status: 'PENDING'
        };

        try {
            if (API_BASE_URL) {
                const token = localStorage.getItem('medora_token');
                await fetch(`${API_BASE_URL}/api/leaves`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(newLeave)
                });
            }
        } catch (err) {
            console.warn("Backend unavailable, adding leave to local state:", err);
        } finally {
            setLeaves(prev => [newLeave, ...prev]);
            setFormData({ ...formData, startDate: '', endDate: '', reason: '' });
            setSuccessMsg('Your leave application has been submitted successfully for administrative review.');
            setTimeout(() => setSuccessMsg(''), 5000);
        }
    };

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', minWidth: 0 }}
        >
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Doctor Leave Application</h1>
                <p>Submit and track your time off requests</p>
            </header>

            {successMsg && (
                <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(35, 83, 71, 0.15)', border: '1px solid rgba(35, 83, 71, 0.3)', borderRadius: '8px', color: 'var(--color-1)', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="var(--color-4)" />
                    {successMsg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1.5rem', width: '100%', minWidth: 0 }}>
                <div className="glass-panel" style={{ padding: '2rem', minWidth: 0 }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-1)' }}>
                        <Calendar size={20} color="var(--color-4)" /> Request Time Off
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-2)', fontSize: '0.85rem', fontWeight: 600 }}>Start Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.7)', color: 'var(--color-1)', fontFamily: 'inherit', boxSizing: 'border-box' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-2)', fontSize: '0.85rem', fontWeight: 600 }}>End Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.7)', color: 'var(--color-1)', fontFamily: 'inherit', boxSizing: 'border-box' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--color-2)', fontSize: '0.85rem', fontWeight: 600 }}>Reason for Absence</label>
                            <textarea 
                                required 
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                rows="3"
                                placeholder="Explain the reason for leave (medical conference, family emergency, research, etc.)..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.7)', color: 'var(--color-1)', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} 
                            ></textarea>
                        </div>
                        <button type="submit" className="action-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Send size={16} /> Submit Leave Request
                        </button>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', minWidth: 0 }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-1)' }}>
                        <FileText size={20} color="var(--color-4)" /> Leave Application History
                    </h3>
                    {leaves.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No previous leave requests found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto', width: '100%' }}>
                            <table style={{ width: '100%', minWidth: '450px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '0.75rem', color: 'var(--color-3)' }}>Dates</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--color-3)' }}>Reason</th>
                                        <th style={{ padding: '0.75rem', color: 'var(--color-3)' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map(l => {
                                        const s = (l.status || 'PENDING').toUpperCase();
                                        return (
                                            <tr key={l.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.08)' }}>
                                                <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--color-1)' }}>
                                                    {l.startDate} <span style={{ color: 'var(--color-5)' }}>to</span> {l.endDate}
                                                </td>
                                                <td style={{ padding: '0.75rem', color: 'var(--color-2)' }}>{l.reason}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.65rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: s === 'APPROVED' ? 'rgba(35, 83, 71, 0.15)' : s === 'REJECTED' ? 'rgba(185, 28, 28, 0.12)' : 'rgba(217, 119, 6, 0.15)',
                                                        color: s === 'APPROVED' ? 'var(--color-2)' : s === 'REJECTED' ? '#b91c1c' : '#b45309',
                                                        border: s === 'APPROVED' ? '1px solid rgba(35, 83, 71, 0.3)' : s === 'REJECTED' ? '1px solid rgba(185, 28, 28, 0.25)' : '1px solid rgba(217, 119, 6, 0.3)'
                                                    }}>
                                                        {s}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
