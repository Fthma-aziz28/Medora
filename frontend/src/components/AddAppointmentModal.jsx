import React, { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import '../pages/Dashboard.css';

export default function AddAppointmentModal({ isOpen, onClose, onUpdated }) {
    const [formData, setFormData] = useState({
        doctorId: '', patientName: '', appointmentDate: '', startTime: '', endTime: '', status: 'Scheduled'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Note: the backend for creating an appointment isn't in CoreDataController yet!
            // I'll need to use a dummy POST for now or assume a future backend POST /api/appointments
            // I will implement the POST /appointments in backend if necessary.
            const response = await fetch(`http://localhost:8080/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                onUpdated();
                onClose();
            } else {
                alert("Failed to add appointment.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
                <h2>Add Appointment</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input type="number" placeholder="Doctor ID" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} required />
                    <input type="text" placeholder="Patient Name" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} required />
                    <input type="date" placeholder="Date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
                    <input type="time" placeholder="Start Time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                    <input type="time" placeholder="End Time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '0.75rem', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                        <option value="Scheduled" style={{ color: '#000' }}>Scheduled</option>
                        <option value="Confirmed" style={{ color: '#000' }}>Confirmed</option>
                    </select>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarPlus size={18} /> Schedule</button>
                        <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
