import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CoverageChart from '../components/charts/CoverageChart';
import WaveChart from '../components/charts/WaveChart';
import QuickActions from '../components/QuickActions';
import AddDoctorModal from '../components/AddDoctorModal';
import UploadDocumentModal from '../components/UploadDocumentModal';
import EditLeaveModal from '../components/EditLeaveModal';
import { Plus, Check, X, Calendar, Edit3, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_LEAVES } from '../demoData';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [leaves, setLeaves] = useState(DEMO_LEAVES);
    const [doctorsCount, setDoctorsCount] = useState(42);
    const [appointmentsCount, setAppointmentsCount] = useState(12);
    const [leaveFilter, setLeaveFilter] = useState('ALL');
    const [editingLeave, setEditingLeave] = useState(null);

    const fetchAllData = async () => {
        fetchLeaves();
        fetchLiveCounts();
    };

    const fetchLiveCounts = async () => {
        if (!API_BASE_URL) return;
        const token = localStorage.getItem('medora_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        try {
            const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
            if (docRes.ok) {
                const docs = await docRes.json();
                if (Array.isArray(docs)) setDoctorsCount(docs.length);
            }
        } catch (e) {
            console.warn("Doctors count fetch error:", e);
        }

        try {
            const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                if (Array.isArray(appts)) setAppointmentsCount(appts.length);
            }
        } catch (e) {
            console.warn("Appointments count fetch error:", e);
        }
    };

    useEffect(() => {
        fetchAllData();

        const handleSync = () => fetchAllData();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, []);

    const fetchLeaves = async () => {
        try {
            if (!API_BASE_URL) {
                setLeaves(DEMO_LEAVES);
                return;
            }
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/leaves`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLeaves(Array.isArray(data) && data.length > 0 ? data : DEMO_LEAVES);
            } else {
                setLeaves(DEMO_LEAVES);
            }
        } catch (error) {
            console.warn("Using fallback leaves for mobile/cloud:", error);
            setLeaves(DEMO_LEAVES);
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            if (API_BASE_URL) {
                const token = localStorage.getItem('medora_token');
                await fetch(`${API_BASE_URL}/api/leaves/${id}/status`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ status })
                });
            }
        } catch (error) {
            console.warn("Backend update failed, applying locally:", error);
        } finally {
            setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
            if (status === 'APPROVED') {
                navigate(`/app/emergency-allocation/${id}`);
            }
        }
    };

    const displayedLeaves = leaves.filter(l => {
        const s = (l.status || '').toUpperCase();
        if (leaveFilter === 'ALL') return true;
        return s === leaveFilter;
    });

    const pendingCount = leaves.filter(l => (l.status || '').toUpperCase() === 'PENDING').length;
    const approvedCount = leaves.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length;
    const rejectedCount = leaves.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length;

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
                    <div className="system-eyebrow">Hospital Operations System</div>
                    <h1>Overview</h1>
                    <div className="header-desc">
                        Physician clinical coverage, live duty allocations, and physician absence authorizations
                    </div>
                </div>
                <div>
                    <button 
                        className="btn-primary-action"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Onboard Doctor</span>
                    </button>
                </div>
            </header>

            {/* Typographic Metrics Strip (Editorial: not separate cards) */}
            <section className="metrics-strip">
                <div className="metric-strip-item">
                    <span className="metric-label">Total Credentialed Doctors</span>
                    <div className="metric-value">{doctorsCount}</div>
                    <span className="metric-subtext">Active physicians across hospital departments</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Active Operational Encounters</span>
                    <div className="metric-value">{appointmentsCount}</div>
                    <span className="metric-subtext">Active patient clinical consultations scheduled</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Identified Coverage Gaps</span>
                    <div className="metric-value" style={{ color: pendingCount > 0 ? '#b45309' : 'var(--color-1)' }}>
                        {pendingCount < 10 ? `0${pendingCount}` : pendingCount}
                    </div>
                    <span className="metric-subtext" style={{ color: pendingCount > 0 ? '#b45309' : 'var(--text-muted)' }}>
                        <AlertCircle size={14} /> {pendingCount} absence requests pending coverage
                    </span>
                </div>
            </section>

            {/* Asymmetrical 2-Column Analytics */}
            <section className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h2>Department Clinical Coverage</h2>
                    </div>
                    <CoverageChart />
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h2>Appointment Encounters</h2>
                    </div>
                    <WaveChart />
                </div>
            </section>

            {/* Operational Actions */}
            <section className="operational-section">
                <div className="section-label-bar">Operational Workflows</div>
                <QuickActions onOpenUpload={() => setIsUploadModalOpen(true)} />
            </section>

            {/* Open Editorial Table: Doctor Leave Applications */}
            <section className="editorial-table-container">
                <div className="editorial-table-header">
                    <div>
                        <h2>Doctor Leave Applications</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Review, authorize, decline, or edit physician absence requests
                        </span>
                    </div>

                    {/* Filter Segmented Control */}
                    <div className="filter-segmented-control">
                        <button 
                            className={`filter-btn ${leaveFilter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setLeaveFilter('ALL')}
                        >
                            All ({leaves.length})
                        </button>
                        <button 
                            className={`filter-btn ${leaveFilter === 'PENDING' ? 'active' : ''}`}
                            onClick={() => setLeaveFilter('PENDING')}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button 
                            className={`filter-btn ${leaveFilter === 'APPROVED' ? 'active' : ''}`}
                            onClick={() => setLeaveFilter('APPROVED')}
                        >
                            Approved ({approvedCount})
                        </button>
                        <button 
                            className={`filter-btn ${leaveFilter === 'REJECTED' ? 'active' : ''}`}
                            onClick={() => setLeaveFilter('REJECTED')}
                        >
                            Declined ({rejectedCount})
                        </button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="editorial-row editorial-row-header">
                    <div>Physician</div>
                    <div>Schedule Period</div>
                    <div>Clinical Specialty & Reason</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {displayedLeaves.length === 0 ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No leave applications match the "{leaveFilter.toLowerCase()}" filter.
                    </div>
                ) : (
                    displayedLeaves.map(leave => {
                        const currentStatus = (leave.status || 'PENDING').toUpperCase();
                        const isApproved = currentStatus === 'APPROVED';
                        const isRejected = currentStatus === 'REJECTED';
                        const isPending = currentStatus === 'PENDING';

                        return (
                            <div key={leave.id} className="editorial-row">
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-1)', fontSize: '0.9rem' }}>
                                        {leave.doctorName || `Physician ID #${leave.doctorId}`}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        {leave.doctorSpecialty || 'General Medicine'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                                    <Calendar size={14} color="var(--text-muted)" />
                                    <span>{leave.startDate} – {leave.endDate}</span>
                                </div>

                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontStyle: leave.reason ? 'italic' : 'normal' }}>
                                        {leave.reason ? `"${leave.reason}"` : 'Standard physician absence'}
                                    </div>
                                </div>

                                <div>
                                    <span className={`status-indicator-dot ${currentStatus.toLowerCase()}`}>
                                        <span style={{ 
                                            width: 6, 
                                            height: 6, 
                                            borderRadius: '50%', 
                                            backgroundColor: isApproved ? 'var(--color-4)' : isRejected ? '#b91c1c' : '#b45309' 
                                        }} />
                                        {currentStatus}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                    {!isApproved && (
                                        <button 
                                            className="row-action-btn accept"
                                            onClick={() => handleLeaveAction(leave.id, 'APPROVED')}
                                            title="Accept and trigger emergency coverage"
                                        >
                                            <Check size={13} />
                                            <span>Accept</span>
                                        </button>
                                    )}

                                    {!isRejected && (
                                        <button 
                                            className="row-action-btn decline"
                                            onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                                            title="Decline leave application"
                                        >
                                            <X size={13} />
                                            <span>Decline</span>
                                        </button>
                                    )}

                                    <button 
                                        className="row-action-btn edit"
                                        onClick={() => setEditingLeave(leave)}
                                        title="Modify leave details"
                                    >
                                        <Edit3 size={13} />
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            {/* Modals */}
            <AddDoctorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onDoctorAdded={() => {
                    alert("Doctor added successfully!");
                }} 
            />

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

            <EditLeaveModal
                isOpen={!!editingLeave}
                leave={editingLeave}
                onClose={() => setEditingLeave(null)}
                onLeaveUpdated={(id, status) => {
                    fetchLeaves();
                    if (status === 'APPROVED') {
                        navigate(`/app/emergency-allocation/${id}`);
                    }
                }}
            />
        </motion.div>
    );
}
