import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Calendar, CheckCircle } from 'lucide-react';
import EditAppointmentModal from '../components/EditAppointmentModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_APPOINTMENTS } from '../demoData';
import './Roster.css';

export default function Appointments() {
    const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
    const [editingAppt, setEditingAppt] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { user } = useAuth();
    const isPatient = user?.role === 'PATIENT';

    const maskName = (name) => {
        if (!name) return '';
        if (isPatient && (name.toLowerCase().includes('emily') || (user?.name && name.toLowerCase().includes(user.name.toLowerCase())))) {
            return name;
        }
        const parts = name.split(' ');
        return parts.map(p => p.charAt(0) + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
    };

    const fetchAppointments = () => {
        if (!API_BASE_URL) return;
        fetch(`${API_BASE_URL}/api/appointments`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setAppointments(data);
            })
            .catch(err => {
                console.warn("Using fallback demo appointments for mobile/cloud:", err);
            });
    };

    useEffect(() => {
        fetchAppointments();
        const handleSync = () => fetchAppointments();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, []);

    const handleDelete = async (id) => {
        const confirmMsg = isPatient 
            ? "Are you sure you want to cancel your scheduled appointment?" 
            : "Are you sure you want to cancel and remove this appointment?";

        if (window.confirm(confirmMsg)) {
            try {
                if (API_BASE_URL) {
                    await fetch(`${API_BASE_URL}/api/appointments/${id}`, { method: 'DELETE' });
                }
            } catch (err) {
                console.warn("Backend delete failed, removing locally:", err);
            } finally {
                setAppointments(prev => prev.filter(a => a.id !== id));
                window.dispatchEvent(new Event('medora_appointment_updated'));
            }
        }
    };

    const handleAppointmentAdded = (newAppt) => {
        if (newAppt) {
            setAppointments(prev => [newAppt, ...prev]);
        }
        fetchAppointments();
    };

    return (
        <div className="roster-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Appointments</h1>
                    <p>{isPatient ? 'Your scheduled clinical consultations and physician visits' : 'Patient scheduling (HIPAA masked)'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                        className="primary-btn" 
                        onClick={() => setIsAddOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> {isPatient ? 'Book Appointment' : 'Add Appointment'}
                    </button>
                </div>
            </header>

            <div className="table-wrapper">
                <table className="medora-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Attending Doctor</th>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Consultation Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(a => (
                            <tr key={a.id}>
                                <td data-label="ID">#{a.id}</td>
                                <td data-label="Doctor">
                                    <strong>{a.doctorName || `Dr. #${a.doctorId}`}</strong>
                                </td>
                                <td data-label="Patient">{maskName(a.patientName)}</td>
                                <td data-label="Date">{a.appointmentDate}</td>
                                <td data-label="Time">{a.startTime?.substring(0, 5)} - {a.endTime?.substring(0, 5)}</td>
                                <td data-label="Status">
                                    <span className={`status-badge ${a.status?.toLowerCase() || ''}`}>{a.status}</span>
                                </td>
                                <td data-label="Actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!isPatient && (
                                        <button onClick={() => setEditingAppt(a)} style={{ background: 'transparent', border: 'none', color: 'var(--color-5)', cursor: 'pointer' }} title="Edit appointment">
                                            <Pencil size={18}/>
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(a.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }} title={isPatient ? "Cancel appointment" : "Delete appointment"}>
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditAppointmentModal 
                isOpen={!!editingAppt} 
                appt={editingAppt} 
                onClose={() => setEditingAppt(null)} 
                onUpdated={fetchAppointments} 
            />

            <AddAppointmentModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onUpdated={handleAppointmentAdded}
            />
        </div>
    );
}
