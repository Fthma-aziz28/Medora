import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import './AddDoctorModal.css';

export default function EditLeaveModal({ isOpen, leave, onClose, onLeaveUpdated }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('PENDING');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (leave) {
            setStartDate(leave.startDate || '');
            setEndDate(leave.endDate || '');
            setReason(leave.reason || '');
            setStatus(leave.status ? leave.status.toUpperCase() : 'PENDING');
            setErrorMsg('');
        }
    }, [leave]);

    if (!isOpen || !leave) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (startDate && endDate && startDate > endDate) {
            setErrorMsg('Start date cannot be after end date.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('medora_token');
            const payload = {
                doctorId: leave.doctorId,
                startDate: startDate,
                endDate: endDate,
                reason: reason,
                status: status
            };

            const res = await fetch(`http://localhost:8080/api/leaves/${leave.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onLeaveUpdated) onLeaveUpdated(leave.id, status);
                onClose();
            } else {
                setErrorMsg('Failed to update leave request. Please check inputs.');
            }
        } catch (err) {
            console.error('Error updating leave', err);
            setErrorMsg('Network error updating leave request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <motion.div 
                className="glass-panel modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                style={{ 
                    maxWidth: '520px', 
                    width: '90%', 
                    padding: '2rem',
                    background: 'linear-gradient(145deg, rgba(218, 241, 222, 0.95), rgba(243, 239, 230, 0.95))',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)'
                }}
            >
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: 'var(--color-1)' }}>
                            Edit Doctor Leave Application
                        </h2>
                        <div style={{ color: 'var(--color-4)', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>
                            {leave.doctorName || `Doctor #${leave.doctorId}`} {leave.doctorSpecialty ? `(${leave.doctorSpecialty})` : ''}
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-3)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(185, 28, 28, 0.1)', border: '1px solid rgba(185, 28, 28, 0.25)', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} /> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-2)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                Start Date
                            </label>
                            <input 
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-2)', marginBottom: '0.4rem', fontWeight: 600 }}>
                                End Date
                            </label>
                            <input 
                                type="date"
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-2)', marginBottom: '0.4rem', fontWeight: 600 }}>
                            Reason & Clinical Notes
                        </label>
                        <textarea 
                            rows={3}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Reason for absence or emergency coverage note..."
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.9rem', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-2)', marginBottom: '0.4rem', fontWeight: 600 }}>
                            Application Status
                        </label>
                        <select 
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.9rem' }}
                        >
                            <option value="PENDING">PENDING - Awaiting Decision</option>
                            <option value="APPROVED">APPROVED - Authorized Leave</option>
                            <option value="REJECTED">REJECTED - Declined</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--color-3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            style={{ padding: '0.65rem 1.5rem', background: 'var(--color-1)', border: 'none', borderRadius: '6px', color: 'var(--color-beige)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(5,31,32,0.25)' }}
                        >
                            <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save & Update Leave'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
