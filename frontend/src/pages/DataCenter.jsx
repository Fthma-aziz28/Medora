import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Database, Users, UploadCloud, ShieldCheck, History, Plus, 
    Search, Filter, CheckCircle2, Clock, XCircle, Stethoscope, Building2, UserPlus 
} from 'lucide-react';
import ImportDoctors from './ImportDoctors';
import PendingDoctors from './PendingDoctors';
import ImportHistory from './ImportHistory';
import AddDoctorModal from '../components/AddDoctorModal';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_DOCTORS, DEMO_DEPARTMENTS } from '../demoData';
import './DataCenter.css';

export default function DataCenter() {
    const [activeTab, setActiveTab] = useState('directory'); // directory, import, pending, history
    const [doctors, setDoctors] = useState(DEMO_DOCTORS);
    const [departments, setDepartments] = useState(DEMO_DEPARTMENTS);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            if (!API_BASE_URL) return;
            const token = localStorage.getItem('medora_token');
            const [docRes, deptRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/doctors`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/departments`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (docRes.ok) {
                const docData = await docRes.json();
                if (Array.isArray(docData) && docData.length > 0) setDoctors(docData);
            }
            if (deptRes.ok) {
                const deptData = await deptRes.json();
                if (Array.isArray(deptData) && deptData.length > 0) setDepartments(deptData);
            }
        } catch (err) {
            console.warn("Using fallback demo doctors for mobile/cloud:", err);
        } finally {
            setLoading(false);
        }
    };

    // Metrics
    const activeCount = doctors.filter(d => !d.status || d.status === 'ACTIVE').length;
    const pendingCount = doctors.filter(d => d.status === 'PENDING_VERIFICATION').length;
    const inactiveCount = doctors.filter(d => d.status === 'INACTIVE' || d.status === 'REJECTED').length;
    const deptCount = departments.length || 5;

    // Filter doctors
    const filteredDoctors = doctors.filter(d => {
        const matchesSearch = 
            (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDept = selectedDept === 'ALL' || String(d.departmentId) === String(selectedDept);
        const docStatus = d.status || 'ACTIVE';
        const matchesStatus = selectedStatus === 'ALL' || docStatus === selectedStatus;

        return matchesSearch && matchesDept && matchesStatus;
    });

    // Department distribution counts
    const deptDistribution = departments.map(dept => {
        const count = doctors.filter(d => d.departmentId === dept.id).length;
        return { name: dept.name, count };
    });

    return (
        <motion.div 
            className="datacenter-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Database size={28} color="var(--color-4)" />
                        <h1 style={{ margin: 0, fontFamily: '"Playfair Display", serif', color: 'var(--color-1)', fontSize: '2.2rem' }}>
                            Data Center
                        </h1>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                        Physician directory, high-throughput spreadsheet ingestion, and verification control.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setActiveTab('import')}
                        className="tab-btn"
                        style={{ background: 'var(--color-6)', color: 'var(--color-1)', borderColor: 'var(--color-4)', fontWeight: 600 }}
                    >
                        <UploadCloud size={18} /> Bulk Ingestion (.xlsx)
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="action-btn"
                    >
                        <Plus size={18} /> Onboard Single Doctor
                    </button>
                </div>
            </div>

            {/* Operational Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.4rem', borderLeft: '4px solid var(--color-4)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>Active Physicians</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--color-4)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{activeCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Verified scheduling resources</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.4rem', borderLeft: '4px solid #d97706' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Verification</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#d97706', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{pendingCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Requires administrator sign-off</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.4rem', borderLeft: '4px solid #b91c1c' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>Inactive / Rejected</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#b91c1c', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{inactiveCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Excluded from duty allocation</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.4rem', borderLeft: '4px solid var(--color-2)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-3)', textTransform: 'uppercase', fontWeight: 600 }}>Hospital Departments</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--color-2)', margin: '0.25rem 0', fontFamily: '"Playfair Display", serif' }}>{deptCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-3)' }}>Clinical specializations</div>
                </div>
            </div>

            {/* Department Breakdown Bar */}
            {deptDistribution.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-1)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={18} color="var(--color-4)" /> Clinician Distribution Across Departments
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                        {deptDistribution.map(d => (
                            <div key={d.name} style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-3)', marginBottom: '0.35rem' }}>
                                    <span>{d.name}</span>
                                    <strong style={{ color: 'var(--color-1)' }}>{d.count}</strong>
                                </div>
                                <div style={{ width: '100%', height: '5px', background: 'rgba(35, 83, 71, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, (d.count / Math.max(1, doctors.length)) * 100)}%`, height: '100%', background: 'var(--color-4)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="datacenter-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directory')}
                >
                    <Users size={18} /> Doctor Directory ({doctors.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
                    onClick={() => setActiveTab('import')}
                >
                    <UploadCloud size={18} /> Import Doctors (.xlsx / .csv)
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <ShieldCheck size={18} /> Pending Verification 
                    {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} /> Ingestion History
                </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. DOCTOR DIRECTORY */}
            {activeTab === 'directory' && (
                <div>
                    {/* Filters & Search */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-4)' }} />
                            <input 
                                type="text"
                                placeholder="Search by physician name, email, or specialty..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <select 
                            value={selectedDept} 
                            onChange={e => setSelectedDept(e.target.value)}
                            style={{ padding: '0.7rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.85rem' }}
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <select 
                            value={selectedStatus} 
                            onChange={e => setSelectedStatus(e.target.value)}
                            style={{ padding: '0.7rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--glass-border)', color: 'var(--color-1)', fontSize: '0.85rem' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING_VERIFICATION">Pending Verification</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    {/* Directory Table */}
                    <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
                        <table className="dc-table">
                            <thead>
                                <tr>
                                    <th>Doctor ID</th>
                                    <th>Physician Name</th>
                                    <th>Department</th>
                                    <th>Specialization</th>
                                    <th>Working Days</th>
                                    <th>Shift Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoctors.map(doc => (
                                    <tr key={doc.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--color-3)' }}>DOC-{doc.id}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-1)' }}>{doc.name || `Dr. (User #${doc.userId})`}</div>
                                            <div style={{ color: 'var(--color-3)', fontSize: '0.8rem' }}>{doc.email || 'No email registered'}</div>
                                        </td>
                                        <td style={{ color: 'var(--color-2)' }}>{doc.departmentName || `Department #${doc.departmentId}`}</td>
                                        <td style={{ color: 'var(--color-4)', fontWeight: 600 }}>{doc.specialty || 'General Practice'}</td>
                                        <td style={{ color: 'var(--color-3)' }}>{doc.workingDays || 'Mon-Fri'}</td>
                                        <td style={{ color: 'var(--color-3)' }}>{doc.startTime || '09:00'} - {doc.endTime || '17:00'}</td>
                                        <td>
                                            <span className={`status-tag ${(!doc.status || doc.status === 'ACTIVE') ? 'active' : doc.status === 'PENDING_VERIFICATION' ? 'pending' : 'inactive'}`}>
                                                {doc.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDoctors.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-3)' }}>
                                            No physician records found matching filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 2. IMPORT DOCTORS (7-Step Wizard) */}
            {activeTab === 'import' && (
                <ImportDoctors onFinish={() => { setActiveTab('directory'); loadData(); }} />
            )}

            {/* 3. PENDING DOCTORS */}
            {activeTab === 'pending' && (
                <PendingDoctors onDoctorVerified={loadData} />
            )}

            {/* 4. IMPORT HISTORY */}
            {activeTab === 'history' && (
                <ImportHistory />
            )}

            {/* Manual Onboarding Modal (Path C) */}
            <AddDoctorModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onDoctorAdded={() => {
                    loadData();
                }} 
            />
        </motion.div>
    );
}
