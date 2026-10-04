import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function LeaveApplication() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: 1, // Will be tied to the current logged in doctor in a real setup
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchLeaves = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/leaves');
            const data = await res.json();
            // In a real app, filter by the logged in doctor ID
            setLeaves(data);
        } catch (err) {
            console.error("Error fetching leaves:", err);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: 'Pending' })
            });
            if (res.ok) {
                setFormData({ ...formData, startDate: '', endDate: '', reason: '' });
                fetchLeaves();
            }
        } catch (err) {
            console.error("Error submitting leave:", err);
        }
    };

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Leave Application</h1>
                <p>Submit and track your leave requests</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} /> Request Time Off
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Start Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>End Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Reason</label>
                            <textarea 
                                required 
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                rows="3"
                                placeholder="Why are you taking leave?"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)', resize: 'none', fontFamily: 'inherit' }} 
                            ></textarea>
                        </div>
                        <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Send size={18} /> Submit Request
                        </button>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Your Previous Requests
                    </h3>
                    {leaves.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No leave requests found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                    <th style={{ padding: '1rem' }}>Start Date</th>
                                    <th style={{ padding: '1rem' }}>End Date</th>
                                    <th style={{ padding: '1rem' }}>Reason</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(l => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{l.startDate}</td>
                                        <td style={{ padding: '1rem' }}>{l.endDate}</td>
                                        <td style={{ padding: '1rem' }}>{l.reason}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                backgroundColor: l.status === 'Approved' ? 'rgba(46, 204, 113, 0.2)' : l.status === 'Rejected' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                                                color: l.status === 'Approved' ? '#27ae60' : l.status === 'Rejected' ? '#c0392b' : '#d35400'
                                            }}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
