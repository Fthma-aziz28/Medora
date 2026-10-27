import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarPlus, Check, User } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import './AddDoctorModal.css';

export default function AddAppointmentModal({ isOpen, onClose, onUpdated }) {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: 1,
        doctorName: '',
        patientName: user?.name || '',
        appointmentDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
        status: 'Confirmed'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (user?.name) {
            setFormData(prev => ({ ...prev, patientName: user.name }));
        }
        
        // Fetch live doctors
        const token = localStorage.getItem('medora_token');
        fetch(`${API_BASE_URL}/api/doctors`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setDoctors(data);
                    setFormData(prev => ({
                        ...prev,
                        doctorId: data[0].id,
                        doctorName: data[0].name || `Dr. #${data[0].id}`
                    }));
                }
            })
            .catch(err => console.error("Error fetching doctors:", err));
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleDoctorSelect = (e) => {
        const id = parseInt(e.target.value);
        const doc = doctors.find(d => d.id === id);
        setFormData({
            ...formData,
            doctorId: id,
            doctorName: doc ? doc.name : `Dr. #${id}`
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('medora_token');
            const payload = {
                doctorId: formData.doctorId,
                patientName: formData.patientName,
                appointmentDate: formData.appointmentDate,
                startTime: formData.startTime.length === 5 ? formData.startTime + ':00' : formData.startTime,
                endTime: formData.endTime.length === 5 ? formData.endTime + ':00' : formData.endTime,
                status: formData.status
            };

            const response = await fetch(`${API_BASE_URL}/api/appointments`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const created = await response.json();
                setSuccessMsg(`Appointment confirmed with ${formData.doctorName}!`);
                window.dispatchEvent(new Event('medora_appointment_updated'));
                if (onUpdated) onUpdated(created);
                setTimeout(() => {
                    onClose();
                    setSuccessMsg('');
                }, 1500);
            } else {
                const errData = await response.text();
                setErrorMsg(errData || 'Failed to schedule appointment. Please check scheduling constraints.');
            }
        } catch (err) {
            console.error("Network error adding appointment:", err);
            setErrorMsg("Network error communicating with the scheduling backend.");
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
                            <h2>{user?.role === 'PATIENT' ? 'Book Clinical Consultation' : 'Schedule New Appointment'}</h2>
                            <p>Reserve a physician consultation slot and confirm outpatient visit</p>
                        </div>
                        <button className="doctor-modal-close" onClick={onClose} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="doctor-modal-body">
                            {/* Section 01: Physician Selection */}
                            <div className="modal-section">
                                <div className="modal-section-title">01 / Attending Physician & Specialty</div>
                                
                                <div className="modal-input-group">
                                    <label>Select Attending Doctor</label>
                                    <select 
                                        value={formData.doctorId} 
                                        onChange={handleDoctorSelect}
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
                                        required
                                    >
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name || `Dr. #${d.id}`} — {d.specialty || d.departmentName || 'General Medicine'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Section 02: Patient & Schedule Timing */}
                            <div className="modal-section">
                                <div className="modal-section-title">02 / Patient & Slot Schedule</div>

                                <div className="modal-input-group">
                                    <label>Patient Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={formData.patientName} 
                                        onChange={e => setFormData({...formData, patientName: e.target.value})} 
                                        required 
                                    />
                                </div>

                                <div className="modal-input-group">
                                    <label>Consultation Date</label>
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
                            </div>
                        </div>

                        {successMsg && (
                            <div style={{
                                padding: '0.65rem 1rem',
                                margin: '0 1.5rem 1rem 1.5rem',
                                background: 'rgba(35, 83, 71, 0.1)',
                                border: '1px solid rgba(35, 83, 71, 0.25)',
                                borderRadius: '4px',
                                color: 'var(--color-4)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                ✓ {successMsg}
                            </div>
                        )}
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
                            <button type="submit" className="btn-submit-doctor" disabled={isSubmitting}>
                                <CalendarPlus size={16} />
                                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
