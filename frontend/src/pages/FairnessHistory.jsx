import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_FAIRNESS_HISTORY } from '../demoData';
import './Dashboard.css';

export default function FairnessHistory() {
    const [history, setHistory] = useState(DEMO_FAIRNESS_HISTORY);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            if (!API_BASE_URL) return;
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/emergency/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) setHistory(data);
            }
        } catch (error) {
            console.warn("Using fallback fairness history for mobile/cloud:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDoctor = (name, id) => {
        if (!name) return `Dr. #${id}`;
        const trimmed = name.trim();
        return trimmed.toLowerCase().startsWith('dr.') ? trimmed : `Dr. ${trimmed}`;
    };

    const formatSlotTime = (record) => {
        if (record.startTime && record.endTime) return `${record.startTime} - ${record.endTime}`;
        if (record.slotTime) return record.slotTime;
        return '09:00 - 17:00';
    };

    if (loading) return <div style={{padding: '2rem'}}>Loading history...</div>;

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Emergency Allocation History</h1>
                <p>Auditable ledger of all emergency duty replacements</p>
            </header>

            <div className="table-wrapper glass-panel" style={{ marginTop: '2rem', overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(35, 83, 71, 0.05)' }}>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Date & Shift Slot</th>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Original Physician</th>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Assigned Replacement</th>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Fairness Equity</th>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Allocation Rational</th>
                            <th style={{ padding: '1rem', color: 'var(--color-1)', fontWeight: 600 }}>Override Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(record => (
                            <tr key={record.id} style={{ borderBottom: '1px solid rgba(35, 83, 71, 0.08)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                    <div style={{ color: 'var(--color-1)', fontWeight: 600 }}>{record.slotDate}</div>
                                    <span style={{ color: 'var(--color-3)', fontSize: '0.82rem', fontWeight: 500 }}>
                                        {formatSlotTime(record)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#c0392b', fontWeight: 600 }}>
                                    {formatDoctor(record.originalDoctorName, record.originalDoctorId)}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--color-4)', fontWeight: 700 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Check size={15} color="var(--color-4)" />
                                        {formatDoctor(record.replacementDoctorName, record.replacementDoctorId)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ 
                                            width: '50px', height: '6px', background: 'rgba(5, 31, 32, 0.1)', borderRadius: '3px', overflow: 'hidden' 
                                        }}>
                                            <div style={{ width: `${record.fairnessScore}%`, height: '100%', background: 'var(--color-4, #235347)' }}></div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--color-1)', fontSize: '0.9rem' }}>{record.fairnessScore}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-2)', maxWidth: '240px', lineHeight: 1.4 }}>
                                    {record.reason}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {record.overrideFlag ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#b91c1c', background: 'rgba(185, 28, 28, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            <ShieldAlert size={14} /> MANUAL
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--color-4)', background: 'rgba(35, 83, 71, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            Automated
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No emergency allocations recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
