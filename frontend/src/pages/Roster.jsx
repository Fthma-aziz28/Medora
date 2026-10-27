import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Stethoscope } from 'lucide-react';
import EditDoctorModal from '../components/EditDoctorModal';
import AddDoctorModal from '../components/AddDoctorModal';
import { API_BASE_URL } from '../apiConfig';
import './Roster.css';

export default function Roster() {
    const [doctors, setDoctors] = useState([]);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDoctors = async () => {
        if (!API_BASE_URL) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('medora_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setDoctors(data);
            }
        } catch (err) {
            console.warn("Doctors fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        const handleSync = () => fetchDoctors();
        window.addEventListener('medora_doctor_updated', handleSync);
        return () => window.removeEventListener('medora_doctor_updated', handleSync);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this doctor from the roster?")) {
            try {
                if (API_BASE_URL) {
                    const token = localStorage.getItem('medora_token');
                    await fetch(`${API_BASE_URL}/api/doctors/${id}`, { 
                        method: 'DELETE',
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                }
            } catch (err) {
                console.warn("Backend delete failed:", err);
            } finally {
                setDoctors(prev => prev.filter(d => d.id !== id));
                window.dispatchEvent(new Event('medora_doctor_updated'));
            }
        }
    };

    const handleDoctorUpdated = () => {
        fetchDoctors();
        window.dispatchEvent(new Event('medora_doctor_updated'));
    };

    return (
        <div className="roster-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Duty Roster</h1>
                    <p>Manage physician schedules, active clinical shifts, and working day rotations</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                        className="primary-btn" 
                        onClick={() => setIsAddOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Add Doctor
                    </button>
                </div>
            </header>

            <div className="table-wrapper glass-panel">
                <table className="medora-table">
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>Department</th>
                            <th>Specialty</th>
                            <th>Working Days</th>
                            <th>Shift Window</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(d => (
                            <tr key={d.id}>
                                <td data-label="Doctor">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Stethoscope size={16} color="var(--color-4)" />
                                        <div>
                                            <strong style={{ color: 'var(--color-1)' }}>{d.name || `Dr. #${d.id}`}</strong>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email || `Staff ID #${d.userId}`}</div>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Department">
                                    <span style={{ fontWeight: 500, color: 'var(--color-3)' }}>
                                        {d.departmentName || 'General Medicine'}
                                    </span>
                                </td>
                                <td data-label="Specialty">{d.specialty || 'General Practice'}</td>
                                <td data-label="Working Days">
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                        {d.workingDays || 'Mon, Wed, Fri'}
                                    </span>
                                </td>
                                <td data-label="Shift Window">
                                    <span style={{ fontSize: '0.85rem' }}>
                                        {d.startTime ? d.startTime.substring(0, 5) : '09:00'} - {d.endTime ? d.endTime.substring(0, 5) : '17:00'}
                                    </span>
                                </td>
                                <td data-label="Status">
                                    <span className="status-badge active">
                                        {d.status || 'ACTIVE'}
                                    </span>
                                </td>
                                <td data-label="Actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => setEditingDoctor(d)} 
                                        style={{ background: 'transparent', border: 'none', color: 'var(--color-5)', cursor: 'pointer' }}
                                        title="Edit doctor schedule"
                                    >
                                        <Pencil size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(d.id)} 
                                        style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                                        title="Remove doctor"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && doctors.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No doctors registered on the duty roster. Click "Add Doctor" or import via Data Center.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <EditDoctorModal 
                isOpen={!!editingDoctor} 
                doctor={editingDoctor} 
                onClose={() => setEditingDoctor(null)} 
                onDoctorUpdated={handleDoctorUpdated} 
            />

            <AddDoctorModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onDoctorAdded={handleDoctorUpdated}
            />
        </div>
    );
}
