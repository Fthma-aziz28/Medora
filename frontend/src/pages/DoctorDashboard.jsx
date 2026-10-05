import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, ArrowRight, PlusCircle, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import './Dashboard.css';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const doctorName = user?.name || 'Dr. Aisha Rahman';

    const upcomingShifts = [
        { day: 'Monday, Oct 5', time: '09:00 – 13:00', ward: 'Cardiology Ward A', status: 'Active Today', badgeClass: 'active' },
        { day: 'Wednesday, Oct 7', time: '09:00 – 13:00', ward: 'Outpatient Cardiology Clinic', status: 'Scheduled', badgeClass: 'scheduled' },
        { day: 'Friday, Oct 9', time: '09:00 – 13:00', ward: 'Cardiac Catheterization Lab', status: 'Scheduled', badgeClass: 'scheduled' },
        { day: 'Saturday, Oct 10', time: '12:00 – 18:00', ward: 'CCU Emergency Standby', status: 'Standby', badgeClass: 'standby' }
    ];

    const todayPatients = [
        { time: '09:00 AM', name: 'Emily Chen', type: 'Post-Op Stent Evaluation', status: 'In Clinic', dotColor: 'var(--color-4)' },
        { time: '09:20 AM', name: 'Michael Rossi', type: 'Hypertension Review', status: 'Waiting', dotColor: '#b45309' },
        { time: '10:00 AM', name: 'David Miller', type: 'Cardiac Arrhythmia Follow-up', status: 'Scheduled', dotColor: 'var(--text-muted)' },
        { time: '11:30 AM', name: 'Sarah Jenkins', type: 'ECG Stress Test Interpretation', status: 'Scheduled', dotColor: 'var(--text-muted)' }
    ];

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
                        {doctorName} · Department of Cardiology · Active Shift Rotation
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
            
            {/* Typographic Metrics Strip */}
            <section className="metrics-strip">
                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/appointments')}
                    title="View patient appointments"
                >
                    <span className="metric-label">Today's Appointments</span>
                    <div className="metric-value">8</div>
                    <span className="metric-subtext">2 completed · 6 remaining today</span>
                </button>

                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/roster')}
                    title="View assigned shift rotations"
                >
                    <span className="metric-label">Upcoming Shifts</span>
                    <div className="metric-value">4</div>
                    <span className="metric-subtext">Cardiology Ward A · Next tomorrow 09:00</span>
                </button>

                <button 
                    className="metric-strip-item clickable-strip-item"
                    onClick={() => navigate('/app/appointments')}
                    title="Review pending diagnostic lab sign-offs"
                >
                    <span className="metric-label">Pending Lab Reviews</span>
                    <div className="metric-value">12</div>
                    <span className="metric-subtext" style={{ color: '#b45309' }}>
                        <AlertCircle size={14} /> 3 urgent ECG & biomarker sign-offs
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
                                Cardiology Ward & Coronary Care Unit (CCU)
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

                {/* Right Column: Today's Patient Consultations */}
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <div>
                            <h2>Today's Patient Queue</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Scheduled consultations for Room 302
                            </span>
                        </div>
                    </div>

                    <div className="patient-queue-list">
                        {todayPatients.map((patient, idx) => (
                            <div key={idx} className="patient-queue-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: 65, fontVariantNumeric: 'tabular-nums' }}>
                                        {patient.time}
                                    </span>
                                    <div className="patient-info">
                                        <strong>{patient.name}</strong>
                                        <span>{patient.type}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: patient.dotColor }} />
                                    <span>{patient.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
                        <button 
                            className="btn-secondary-action" 
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => navigate('/app/appointments')}
                        >
                            <span>Open Appointment Registry</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Leave Applications & Absence Pre-Allocation Status */}
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

                <div className="editorial-row">
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-1)' }}>#LEV-2026-101</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cardiology Department</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                        Oct 06 – Oct 08, 2026
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "International Cardiology Symposium Keynote"
                    </div>
                    <div>
                        <span className="status-indicator-dot pending">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#b45309' }} />
                            PENDING REVIEW
                        </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--color-4)', fontWeight: 500 }}>
                        Candidate: Dr. Sara Lin (94.2)
                    </div>
                </div>
            </section>
        </motion.div>
    );
}
