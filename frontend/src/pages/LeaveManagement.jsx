import React, { useState, useEffect } from 'react';
import './LeaveManagement.css';
import { Check, X, Clock, Edit3, Trash2, Calendar, Stethoscope, AlertCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditLeaveModal from '../components/EditLeaveModal';

export default function LeaveManagement() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [editingLeave, setEditingLeave] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
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
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
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
                setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
                if (status === 'APPROVED') {
                    navigate(`/app/emergency-allocation/${id}`);
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor leave record?")) return;
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`http://localhost:8080/api/leaves/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setLeaves(leaves.filter(l => l.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete leave", error);
        }
    };

    const filteredLeaves = leaves.filter(l => {
        const s = (l.status || 'PENDING').toUpperCase();
        const matchesFilter = filter === 'ALL' || s === filter;
        const matchesSearch = 
            (l.doctorName || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.doctorSpecialty || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.reason || '').toLowerCase().includes(search.toLowerCase()) ||
            String(l.doctorId).includes(search);
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div style={{ padding: '3rem', color: '#94a3b8' }}>Loading leave management records...</div>;

    return (
        <div className="roster-container leave-management">
            <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Doctor Leave Management</h1>
                <p>Administrative portal to review, approve, decline, or edit physician leave applications</p>
            </header>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(35, 83, 71, 0.1)', padding: '0.25rem', borderRadius: '8px' }}>
                    {[
                        { key: 'ALL', label: `All Leaves (${leaves.length})` },
                        { key: 'PENDING', label: `Pending (${leaves.filter(l => (l.status || '').toUpperCase() === 'PENDING').length})` },
                        { key: 'APPROVED', label: `Approved (${leaves.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length})` },
                        { key: 'REJECTED', label: `Declined (${leaves.filter(l => (l.status || '').toUpperCase() === 'REJECTED').length})` }
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '0.4rem 0.85rem',
                                border: 'none',
                                borderRadius: '6px',
                                background: filter === f.key ? 'var(--color-4)' : 'transparent',
                                color: filter === f.key ? 'var(--color-beige)' : 'var(--color-3)',
                                fontWeight: filter === f.key ? 600 : 500,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <input 
                    type="text"
                    placeholder="Search doctor or clinical reason..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.85rem', minWidth: '260px', outline: 'none' }}
                />
            </div>
            
            {filteredLeaves.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#8E9BA2' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No doctor leave requests found matching selected filter.</p>
                </div>
            ) : (
                <div className="table-wrapper glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                    <table className="roster-table desktop-only" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Physician</th>
                                <th>Specialty</th>
                                <th>Absence Period</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map((leave) => {
                                const currentStatus = (leave.status || 'PENDING').toUpperCase();
                                return (
                                    <tr key={leave.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-1)' }}>
                                                {leave.doctorName || `Dr. (ID #${leave.doctorId})`}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>DOC-{leave.doctorId}</div>
                                        </td>
                                        <td style={{ color: 'var(--color-4)', fontWeight: 600 }}>
                                            {leave.doctorSpecialty || 'General Practitioner'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-2)', fontSize: '0.85rem' }}>
                                                <Calendar size={13} color="var(--color-4)" />
                                                <span>{leave.startDate} to {leave.endDate}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--color-1)', fontSize: '0.85rem', maxWidth: '240px' }}>
                                            {leave.reason || 'Personal / Medical Leave'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${currentStatus.toLowerCase()}`}>
                                                {currentStatus}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                {/* Approve */}
                                                {currentStatus !== 'APPROVED' && (
                                                    <button 
                                                        className="approve-btn" 
                                                        onClick={() => updateStatus(leave.id, 'APPROVED')}
                                                        title="Approve & Trigger Emergency Replacement Check"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                )}

                                                {/* Reject */}
                                                {currentStatus !== 'REJECTED' && (
                                                    <button 
                                                        className="reject-btn" 
                                                        onClick={() => updateStatus(leave.id, 'REJECTED')}
                                                        title="Decline Leave"
                                                    >
                                                        <X size={14} /> Decline
                                                    </button>
                                                )}

                                                {/* Edit */}
                                                <button 
                                                    onClick={() => setEditingLeave(leave)}
                                                    style={{ padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.7)', color: 'var(--color-1)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 500 }}
                                                    title="Edit Dates / Notes / Status"
                                                >
                                                    <Edit3 size={14} color="var(--color-3)" /> Edit
                                                </button>

                                                {/* Delete */}
                                                <button 
                                                    onClick={() => handleDelete(leave.id)}
                                                    style={{ padding: '0.45rem 0.6rem', background: 'rgba(185,28,28,0.08)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.2)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Mobile View: Compact Cards */}
                    <div className="mobile-cards">
                        {filteredLeaves.map((leave) => {
                            const currentStatus = (leave.status || 'PENDING').toUpperCase();
                            return (
                                <div key={leave.id} className="mobile-card">
                                    <div className="card-header">
                                        <div className="card-title">
                                            {leave.doctorName || `Doc ID: ${leave.doctorId}`}
                                            <span style={{ fontSize: '0.8rem', color: '#2dd4bf', marginLeft: '0.5rem' }}>
                                                {leave.doctorSpecialty}
                                            </span>
                                        </div>
                                        <div className={`status-badge ${currentStatus.toLowerCase()}`}>{currentStatus}</div>
                                    </div>
                                    <div className="card-body">
                                        <div className="info-row">
                                            <span className="label">Dates:</span>
                                            <span className="value">{leave.startDate} to {leave.endDate}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Reason:</span>
                                            <span className="value">{leave.reason || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="card-actions" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {currentStatus !== 'APPROVED' && (
                                            <button className="approve-btn" onClick={() => updateStatus(leave.id, 'APPROVED')}>
                                                <Check size={16} /> Approve
                                            </button>
                                        )}
                                        {currentStatus !== 'REJECTED' && (
                                            <button className="reject-btn" onClick={() => updateStatus(leave.id, 'REJECTED')}>
                                                <X size={16} /> Decline
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setEditingLeave(leave)}
                                            style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                                        >
                                            <Edit3 size={15} /> Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
        </div>
    );
}
