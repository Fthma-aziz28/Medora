import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import EditDoctorModal from '../components/EditDoctorModal';
import AddDoctorModal from '../components/AddDoctorModal';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_DOCTORS } from '../demoData';
import DateRangePicker from '@/components/ui/date-range-picker';
import './Roster.css';

export default function Roster() {
    const [doctors, setDoctors] = useState(DEMO_DOCTORS);
    const [dateRange, setDateRange] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const fetchDoctors = () => {
        if (!API_BASE_URL) return;
        fetch(`${API_BASE_URL}/api/doctors`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setDoctors(data);
            })
            .catch(err => {
                console.warn("Using fallback demo roster for mobile/cloud:", err);
            });
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this doctor from the roster?")) {
            try {
                if (API_BASE_URL) {
                    await fetch(`${API_BASE_URL}/api/doctors/${id}`, { method: 'DELETE' });
                }
            } catch (err) {
                console.warn("Backend delete failed, removing locally:", err);
            } finally {
                setDoctors(prev => prev.filter(d => d.id !== id));
            }
        }
    };

    return (
        <div className="roster-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Duty Roster</h1>
                    <p>Manage physician schedules and active shift rotations</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <DateRangePicker 
                        onChange={setDateRange}
                        placeholder="Roster Period"
                    />
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
                            <th>Doctor ID</th>
                            <th>Specialty</th>
                            <th>Dept ID</th>
                            <th>Working Days</th>
                            <th>Shift Time</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(d => (
                            <tr key={d.id}>
                                <td data-label="Doctor ID">{d.userId}</td>
                                <td data-label="Specialty">{d.specialty || 'General'}</td>
                                <td data-label="Dept ID">{d.departmentId}</td>
                                <td data-label="Working Days">{d.workingDays}</td>
                                <td data-label="Shift Time">{d.startTime} - {d.endTime}</td>
                                <td data-label="Actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setEditingDoctor(d)} style={{ background: 'transparent', border: 'none', color: 'var(--color-5)', cursor: 'pointer' }}><Pencil size={18}/></button>
                                    <button onClick={() => handleDelete(d.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditDoctorModal 
                isOpen={!!editingDoctor} 
                doctor={editingDoctor} 
                onClose={() => setEditingDoctor(null)} 
                onDoctorUpdated={fetchDoctors} 
            />

            <AddDoctorModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onDoctorAdded={fetchDoctors}
            />
        </div>
    );
}
