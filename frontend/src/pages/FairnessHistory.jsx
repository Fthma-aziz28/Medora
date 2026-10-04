import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';
import './Dashboard.css';

export default function FairnessHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch('http://localhost:8080/api/emergency/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
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
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <th style={{ padding: '1rem' }}>Date & Slot</th>
                            <th style={{ padding: '1rem' }}>Original Doctor</th>
                            <th style={{ padding: '1rem' }}>Replacement Doctor</th>
                            <th style={{ padding: '1rem' }}>Fairness Score</th>
                            <th style={{ padding: '1rem' }}>Reason</th>
                            <th style={{ padding: '1rem' }}>Override?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(record => (
                            <tr key={record.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                    {record.slotDate} <br/>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{record.startTime} - {record.endTime}</span>
                                </td>
                                <td style={{ padding: '1rem', color: '#e74c3c' }}>
                                    Dr. {record.originalDoctorName || record.originalDoctorId}
                                </td>
                                <td style={{ padding: '1rem', color: '#27ae60', fontWeight: 'bold' }}>
                                    Dr. {record.replacementDoctorName || record.replacementDoctorId}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ 
                                            width: '40px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' 
                                        }}>
                                            <div style={{ width: `${record.fairnessScore}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                                        </div>
                                        <span style={{ fontWeight: 'bold' }}>{record.fairnessScore}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', maxWidth: '200px' }}>{record.reason}</td>
                                <td style={{ padding: '1rem' }}>
                                    {record.overrideFlag ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d35400', background: 'rgba(211, 84, 0, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                            <ShieldAlert size={14} /> YES
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No</span>
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
