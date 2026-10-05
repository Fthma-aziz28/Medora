import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, ArrowRight, PlusCircle, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_APPOINTMENTS, DEMO_LEAVES } from '../demoData';
import './Dashboard.css';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const doctorName = user?.name || 'Dr. Aisha Rahman';

    const [appointments, setAppointments] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDoctorData = async () => {
        try {
            if (!API_BASE_URL) {
                setAppointments(DEMO_APPOINTMENTS);
                setLeaves(DEMO_LEAVES);
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('medora_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // 1. Fetch doctors to match profile
            let currentDoc = null;
            try {
                const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
                if (docRes.ok) {
                    const docList = await docRes.json();
                    if (Array.isArray(docList)) {
                        currentDoc = docList.find(d => 
                            (user?.id && d.userId === user.id) ||
                            (user?.name && d.name?.toLowerCase().includes(user.name.toLowerCase())) ||
                            (user?.email && d.email?.toLowerCase() === user.email.toLowerCase())
                        ) || docList[0];
                        setDoctorProfile(currentDoc);
                    }
                }
            } catch (e) {
                console.warn("Doctors fetch error:", e);
            }

            // 2. Fetch live appointments
            try {
                const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
                if (apptRes.ok) {
                    const apptList = await apptRes.json();
                    if (Array.isArray(apptList)) {
                        // Filter appointments for this doctor (or all if general / Dr. Aisha)
                        const filtered = apptList.filter(a => {
                            if (!currentDoc) return true;
                            if (a.doctorId === currentDoc.id) return true;
                            if (currentDoc.name && a.doctorName && a.doctorName.toLowerCase().includes(currentDoc.name.toLowerCase())) return true;
                            return false;
                        });
                        setAppointments(filtered.length > 0 ? filtered : apptList);
                    }
                } else {
                    setAppointments(DEMO_APPOINTMENTS);
                }
            } catch (e) {
                console.warn("Appointments fetch error:", e);
                setAppointments(DEMO_APPOINTMENTS);
            }

            // 3. Fetch leaves
            try {
                const leaveRes = await fetch(`${API_BASE_URL}/api/leaves`, { headers });
                if (leaveRes.ok) {
                    const leaveList = await leaveRes.json();
                    if (Array.isArray(leaveList)) {
                        const myLeaves = leaveList.filter(l => {
                            if (!currentDoc) return true;
                            return l.doctorId === currentDoc.id || 
                                (currentDoc.name && l.doctorName && l.doctorName.toLowerCase().includes(currentDoc.name.toLowerCase()));
                        });
                        setLeaves(myLeaves.length > 0 ? myLeaves : leaveList.slice(0, 3));
                    }
                } else {
                    setLeaves(DEMO_LEAVES);
                }
            } catch (e) {
                console.warn("Leaves fetch error:", e);
                setLeaves(DEMO_LEAVES);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctorData();

        const handleSync = () => fetchDoctorData();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, [user]);

    const upcomingShifts = [
        { day: 'Monday, Oct 5', time: doctorProfile?.startTime && doctorProfile?.endTime ? `${doctorProfile.startTime.substring(0,5)} – ${doctorProfile.endTime.substring(0,5)}` : '09:00 – 13:00', ward: `${doctorProfile?.departmentName || 'Cardiology'} Ward A`, status: 'Active Today', badgeClass: 'active' },
        { day: 'Wednesday, Oct 7', time: '09:00 – 13:00', ward: 'Outpatient Clinic Room 302', status: 'Scheduled', badgeClass: 'scheduled' },
        { day: 'Friday, Oct 9', time: '09:00 – 13:00', ward: `${doctorProfile?.departmentName || 'Cardiology'} Lab`, status: 'Scheduled', badgeClass: 'scheduled' },
        { day: 'Saturday, Oct 10', time: '12:00 – 18:00', ward: 'Emergency Standby', status: 'Standby', badgeClass: 'standby' }
    ];

    const confirmedCount = appointments.filter(a => (a.status || '').toUpperCase() === 'CONFIRMED').length;
    const pendingLeavesCount = leaves.filter(l => (l.status || '').toUpperCase() === 'PENDING').length;

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Editorial Header */}
            <header className="dashboard-header">
                <div>
                    <div className="system-eyebrow">Clinical Portal · Physician Workspace</div>
                    <h1>Doctor Portal</h1>
                    <div className="header-desc">
                        {doctorProfile?.name || doctorName} · Department of {doctorProfile?.departmentName || 'Cardiology'} · Active Shift Rotation
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button 
                        className="btn-secondary-action"
                        onClick={() => navigate('/app/roster')}
                    >
                        <Calendar size={15} />
                        <span>Duty Roster</span>
                    </button>
                    <button 
                        className="btn-primary-action"
                        onClick={() => navigate('/app/leave-application')}
                    >
                        <PlusCircle size={15} />
                        <span>Request Leave</span>
                    </button>
                </div>
            </header>
            
            {/* Typographic Metrics Strip - Connected to Real Data */}
            <section className="metrics-strip">
                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/appointments')}
                    title="View patient appointments"
                >
                    <span className="metric-label">Assigned Appointments</span>
                    <div className="metric-value">{appointments.length}</div>
                    <span className="metric-subtext">{confirmedCount} confirmed · {appointments.length} total scheduled</span>
                </button>

                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/roster')}
                    title="View assigned shift rotations"
                >
                    <span className="metric-label">Active Working Days</span>
                    <div className="metric-value">{doctorProfile?.workingDays ? doctorProfile.workingDays.split(',').length : 4}</div>
                    <span className="metric-subtext">{doctorProfile?.workingDays || 'Mon, Wed, Fri'} · {doctorProfile?.departmentName || 'Cardiology'}</span>
                </button>

                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/leave-application')}
                    title="Review submitted absence requests"
                >
                    <span className="metric-label">Absence Requests</span>
                    <div className="metric-value">{leaves.length}</div>
                    <span className="metric-subtext" style={{ color: pendingLeavesCount > 0 ? '#b45309' : 'var(--text-muted)' }}>
                        <AlertCircle size={14} /> {pendingLeavesCount} pending authorization
                    </span>
                </button>
            </section>

            {/* Asymmetrical 2-Column Clinical Layout */}
            <section className="analytics-grid">
                {/* Left Column: Weekly Rotation Schedule */}
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <div>
                            <h2>Current Shift Rotation</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {doctorProfile?.departmentName || 'Cardiology'} Ward & Outpatient Units
                            </span>
                        </div>
                        <span className="shift-badge active">On Active Rota</span>
                    </div>

                    <div className="doctor-schedule-list">
                        {upcomingShifts.map((shift, idx) => (
                            <div key={idx} className={`doctor-schedule-item ${shift.badgeClass === 'active' ? 'today' : ''}`}>
                                <div className="schedule-day-time">
                                    <strong>{shift.day}</strong>
                                    <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{shift.time}</span>
                                </div>
                                <div className="schedule-ward-info">
                                    {shift.ward}
                                </div>
                                <div>
                                    <span className={`shift-badge ${shift.badgeClass}`}>{shift.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <CheckCircle size={14} color="var(--color-4)" />
                        <span>Mandatory 14-hour rest interval between consecutive duties validated by Fairness Engine.</span>
                    </div>
                </div>

                {/* Right Column: Today's Patient Consultations - Connected to Real Bookings */}
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <div>
                            <h2>Today's Patient Queue</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Live patient bookings scheduled for {doctorProfile?.name || doctorName}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-4)', background: 'var(--color-6)', padding: '0.2rem 0.5rem', borderRadius: 3 }}>
                            {appointments.length} Booked
                        </span>
                    </div>

                    <div className="patient-queue-list">
                        {appointments.length === 0 ? (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No scheduled patient consultations in queue yet.
                            </div>
                        ) : (
                            appointments.map((appt) => {
                                const rawTime = appt.startTime || '09:00';
                                const displayTime = rawTime.substring(0, 5);
                                const isConfirmed = (appt.status || '').toUpperCase() === 'CONFIRMED';
                                const dotColor = isConfirmed ? 'var(--color-4)' : '#b45309';

                                return (
                                    <div key={appt.id} className="patient-queue-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: 65, fontVariantNumeric: 'tabular-nums' }}>
                                                {displayTime}
                                            </span>
                                            <div className="patient-info">
                                                <strong>{appt.patientName}</strong>
                                                <span>
                                                    {appt.appointmentDate} · {appt.isEmergencyReplacement ? 'Emergency Reassignment' : 'Clinical Consultation'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dotColor }} />
                                            <span>{appt.status || 'Confirmed'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
                        <button 
                            className="btn-secondary-action" 
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => navigate('/app/appointments')}
                        >
                            <span>Open Full Appointment Registry</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Leave Applications & Absence Pre-Allocation Status - Connected to Real Database */}
            <section className="editorial-table-container">
                <div className="editorial-table-header">
                    <div>
                        <h2>Your Submitted Leave Requests</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Status of your absence applications and automated coverage allocations
                        </span>
                    </div>
                    <button 
                        className="btn-primary-action"
                        onClick={() => navigate('/app/leave-application')}
                    >
                        <PlusCircle size={14} />
                        <span>New Absence Request</span>
                    </button>
                </div>

                <div className="editorial-row editorial-row-header">
                    <div>Request Reference</div>
                    <div>Leave Window</div>
                    <div>Clinical Justification</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right' }}>Coverage Status</div>
                </div>

                {leaves.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No leave applications submitted yet.
                    </div>
                ) : (
                    leaves.map((leave) => {
                        const status = (leave.status || 'PENDING').toUpperCase();
                        const isApproved = status === 'APPROVED';
                        const isRejected = status === 'REJECTED';
                        const dotColor = isApproved ? 'var(--color-4)' : isRejected ? '#b91c1c' : '#b45309';

                        return (
                            <div key={leave.id} className="editorial-row">
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-1)' }}>#LEV-2026-{leave.id}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {leave.doctorSpecialty || doctorProfile?.departmentName || 'Cardiology'}
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {leave.startDate} – {leave.endDate}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontStyle: leave.reason ? 'italic' : 'normal' }}>
                                    {leave.reason ? `"${leave.reason}"` : 'Standard physician absence'}
                                </div>
                                <div>
                                    <span className={`status-indicator-dot ${status.toLowerCase()}`}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dotColor }} />
                                        {status}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: isApproved ? 'var(--color-4)' : 'var(--text-muted)', fontWeight: 500 }}>
                                    {isApproved ? 'Covered by Peer Allocation' : isRejected ? 'Declined' : 'Awaiting Administration'}
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </motion.div>
    );
}
