import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import '../pages/Dashboard.css';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/appointments/${appt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                onUpdated();
                onClose();
            } else {
                alert("Failed to update appointment.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
                <h2>Edit Appointment</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input type="date" placeholder="Date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
                    <input type="time" placeholder="Start Time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                    <input type="time" placeholder="End Time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                        <option value="Confirmed" style={{ color: '#000' }}>Confirmed</option>
                        <option value="Cancelled" style={{ color: '#000' }}>Cancelled</option>
                        <option value="Completed" style={{ color: '#000' }}>Completed</option>
                    </select>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} /> Save Changes</button>
                        <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
