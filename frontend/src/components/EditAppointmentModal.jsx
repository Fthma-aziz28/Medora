import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './AddDoctorModal.css';

export default function EditAppointmentModal({ isOpen, onClose, appt, onUpdated }) {
    const [formData, setFormData] = useState({
        appointmentDate: '', startTime: '', endTime: '', status: ''
    });

    useEffect(() => {
        if (appt) {
            setFormData({
                appointmentDate: appt.appointmentDate || '',
                startTime: appt.startTime || '',
                endTime: appt.endTime || '',
                status: appt.status || 'Confirmed'
            });
        }
    }, [appt]);

    if (!isOpen || !appt) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('medora_token');
            const response = await fetch(`${API_BASE_URL}/api/appointments/${appt.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                if (onUpdated) onUpdated();
                onClose();
            } else {
                const text = await response.text();
                setErrorMsg(text || "Failed to update appointment record.");
            }
        } catch (err) {
            console.error("Network error updating appointment:", err);
            setErrorMsg("Network error connecting to scheduling service.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="doctor-modal-overlay" onClick={onClose}>
                <motion.div 
                    className="doctor-modal-card" 
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Header */}
                    <div className="doctor-modal-header">
                        <div>
                            <h2>Edit Appointment Schedule</h2>
                            <p>Update consultation slot date, shift hours, and booking status</p>
                        </div>
                        <button className="doctor-modal-close" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="doctor-modal-body">
                            <div className="modal-section">
                                <div className="modal-section-title">Schedule Timing</div>
                                
                                <div className="modal-input-group">
                                    <label>Appointment Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.appointmentDate} 
                                        onChange={e => setFormData({...formData, appointmentDate: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className="modal-grid-2">
                                    <div className="modal-input-group">
                                        <label>Slot Start Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.startTime} 
                                            onChange={e => setFormData({...formData, startTime: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                    <div className="modal-input-group">
                                        <label>Slot End Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.endTime} 
                                            onChange={e => setFormData({...formData, endTime: e.target.value})} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="modal-input-group">
                                    <label>Booking Status</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                        style={{
                                            background: '#FAF9F5',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '4px',
                                            padding: '0.65rem 0.85rem',
                                            fontSize: '0.85rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--color-1)',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {errorMsg && (
                            <div style={{
                                padding: '0.65rem 1rem',
                                margin: '0 1.5rem 1rem 1.5rem',
                                background: 'rgba(197, 48, 48, 0.08)',
                                border: '1px solid rgba(197, 48, 48, 0.25)',
                                borderRadius: '4px',
                                color: '#C53030',
                                fontSize: '0.85rem'
                            }}>
                                {errorMsg}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="doctor-modal-footer">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit-doctor">
                                <Save size={16} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
