import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CoverageChart from '../components/charts/CoverageChart';
import WaveChart from '../components/charts/WaveChart';
import QuickActions from '../components/QuickActions';
import AddDoctorModal from '../components/AddDoctorModal';
import UploadDocumentModal from '../components/UploadDocumentModal';
import EditLeaveModal from '../components/EditLeaveModal';
import { Plus, Check, X, MessageSquare, Edit3, Calendar, FileText } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [leaveFilter, setLeaveFilter] = useState('ALL');
    const [comment, setComment] = useState('');
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [editingLeave, setEditingLeave] = useState(null);

    React.useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch('http://localhost:8080/api/leaves', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`http://localhost:8080/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchLeaves();
                setActiveCommentId(null);
                setComment('');
                if (status === 'APPROVED') {
                    navigate(`/app/emergency-allocation/${id}`);
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } }
    };

    return (
        <motion.div 
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', minWidth: 0 }}
        >
            <motion.header className="page-header" variants={itemVariants}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Overview</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Hospital Operations Summary</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'var(--color-1)',
                            color: 'var(--color-6)', padding: '0.75rem 1.25rem', borderRadius: '8px',
                            border: 'none', cursor: 'pointer', fontWeight: '600',
                            fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(5,31,32,0.3)'
                        }}
                    >
                        <Plus size={18} /> Add Doctor
                    </button>
                </div>
            </motion.header>
            
            <motion.div className="metrics-grid" variants={itemVariants}>
                <div className="metric-card glass-panel">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Total Doctors</h3>
                    <p className="value" style={{ color: 'var(--color-1)' }}>42</p>
                </div>
                <div className="metric-card glass-panel">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Active Duties</h3>
                    <p className="value" style={{ color: 'var(--color-2)' }}>12</p>
                </div>
                <div className="metric-card alert glass-panel" style={{ border: '1px solid var(--color-4)' }}>
                    <h3 style={{ color: 'var(--text-secondary)' }}>Coverage Gaps</h3>
                    <p className="value" style={{ color: 'var(--color-4)' }}>3</p>
                </div>
            </motion.div>

            <motion.div className="charts-grid" variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem', minWidth: 0, width: '100%' }}>
                <div className="chart-container glass-panel" style={{ padding: '1.5rem', minWidth: 0, overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Department Coverage</h3>
                    <CoverageChart />
                </div>
                
                <div className="chart-container glass-panel" style={{ padding: '1.5rem', minWidth: 0, overflow: 'hidden' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Appointment Volume</h3>
                    <WaveChart />
                </div>
                
                <div className="chart-container glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)', fontFamily: '"Playfair Display", serif' }}>Administrative Quick Actions</h3>
                    <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fast access to common operational workflows</p>
                    <QuickActions onOpenUpload={() => setIsUploadModalOpen(true)} />
                </div>
            </motion.div>

            <motion.div className="glass-panel" variants={itemVariants} style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontFamily: '"Playfair Display", serif', color: 'var(--color-1)', fontSize: '1.35rem' }}>
                            Doctor Leave Applications
                        </h3>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Review, authorize, decline, or edit physician absence requests
                        </p>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(35, 83, 71, 0.1)', padding: '0.25rem', borderRadius: '8px' }}>
                        {[
                            { key: 'ALL', label: `All (${leaves.length})` },
                            { key: 'PENDING', label: `Pending (${leaves.filter(l => (l.status || '').toUpperCase() === 'PENDING').length})` },
                            { key: 'APPROVED', label: `Approved (${leaves.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length})` },
                            { key: 'REJECTED', label: `Declined (${leaves.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length})` }
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setLeaveFilter(f.key)}
                                style={{
                                    padding: '0.35rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: leaveFilter === f.key ? 'var(--color-4)' : 'transparent',
                                    color: leaveFilter === f.key ? 'var(--color-beige)' : 'var(--color-3)',
                                    fontWeight: leaveFilter === f.key ? 600 : 500,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {(() => {
                    const displayedLeaves = leaves.filter(l => {
                        const s = (l.status || '').toUpperCase();
                        if (leaveFilter === 'ALL') return true;
                        return s === leaveFilter;
                    });

                    if (displayedLeaves.length === 0) {
                        return (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.3)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No leave applications match the "{leaveFilter.toLowerCase()}" filter.</p>
                            </div>
                        );
                    }

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {displayedLeaves.map(leave => {
                                const currentStatus = (leave.status || 'PENDING').toUpperCase();
                                return (
                                    <div 
                                        key={leave.id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '1.1rem 1.25rem', 
                                            background: 'rgba(255,255,255,0.45)', 
                                            borderRadius: '10px', 
                                            border: '1px solid var(--glass-border)',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: '240px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-1)', fontSize: '1rem' }}>
                                                    {leave.doctorName || `Dr. (ID #${leave.doctorId})`}
                                                </span>
                                                {leave.doctorSpecialty && (
                                                    <span style={{ color: 'var(--color-4)', fontSize: '0.8rem', background: 'var(--color-6)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(35,83,71,0.2)' }}>
                                                        {leave.doctorSpecialty}
                                                    </span>
                                                )}
                                                <span className={`status-tag ${currentStatus === 'APPROVED' ? 'active' : currentStatus === 'REJECTED' ? 'inactive' : 'pending'}`}>
                                                    {currentStatus}
                                                </span>
                                            </div>
                                            
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-3)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                                                <Calendar size={14} color="var(--color-4)" />
                                                <span>{leave.startDate} to {leave.endDate}</span>
                                            </div>

                                            {leave.reason && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-2)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                                    "{leave.reason}"
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {/* Accept / Approve */}
                                            {currentStatus !== 'APPROVED' && (
                                                <button 
                                                    onClick={() => handleLeaveAction(leave.id, 'APPROVED')} 
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', background: 'var(--color-4)', color: 'var(--color-beige)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(5,31,32,0.15)' }}
                                                    title="Accept & Review Emergency Coverage"
                                                >
                                                    <Check size={15} /> Accept
                                                </button>
                                            )}

                                            {/* Decline / Reject */}
                                            {currentStatus !== 'REJECTED' && (
                                                <button 
                                                    onClick={() => handleLeaveAction(leave.id, 'REJECTED')} 
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', background: 'rgba(185, 28, 28, 0.1)', color: '#b91c1c', border: '1px solid rgba(185, 28, 28, 0.25)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                    title="Decline Leave"
                                                >
                                                    <X size={15} /> Decline
                                                </button>
                                            )}

                                            {/* Edit Leave */}
                                            <button 
                                                onClick={() => setEditingLeave(leave)} 
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', background: 'rgba(255, 255, 255, 0.7)', color: 'var(--color-1)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                                title="Edit Leave Details"
                                            >
                                                <Edit3 size={15} color="var(--color-3)" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </motion.div>

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
