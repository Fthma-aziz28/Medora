import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import '../pages/Dashboard.css';

export default function EditDoctorModal({ isOpen, onClose, doctor, onDoctorUpdated }) {
    const [formData, setFormData] = useState({
        departmentId: '', specialty: '', workingDays: '', startTime: '', endTime: '', slotMins: ''
    });

    useEffect(() => {
        if (doctor) {
            setFormData({
                departmentId: doctor.departmentId || '',
                specialty: doctor.specialty || '',
                workingDays: doctor.workingDays || '',
                startTime: doctor.startTime || '',
                endTime: doctor.endTime || '',
                slotMins: doctor.slotMins || 20
            });
        }
    }, [doctor]);

    if (!isOpen || !doctor) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/doctors/${doctor.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                onDoctorUpdated();
                onClose();
            } else {
                alert("Failed to update doctor.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={24} /></button>
                <h2>Edit Doctor</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input type="text" placeholder="Department ID" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} />
                    <input type="text" placeholder="Specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
                    <input type="text" placeholder="Working Days (e.g. 1,2,3)" value={formData.workingDays} onChange={e => setFormData({...formData, workingDays: e.target.value})} />
                    <input type="time" placeholder="Start Time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    <input type="time" placeholder="End Time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    <input type="number" placeholder="Slot Mins" value={formData.slotMins} onChange={e => setFormData({...formData, slotMins: e.target.value})} />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} /> Save Changes</button>
                        <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
