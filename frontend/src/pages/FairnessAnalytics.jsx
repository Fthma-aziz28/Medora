import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';
import { DEMO_FAIRNESS_HISTORY } from '../demoData';
import './Dashboard.css';

export default function FairnessAnalytics() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            if (!API_BASE_URL) {
                setLoading(false);
                return;
            }
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/emergency/history`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setHistory(data);
            }
        } catch (error) {
            console.warn("Fairness analytics fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{padding: '2rem'}}>Loading analytics...</div>;

    // Derived Analytics Data
    const replacementsMap = {};
    const scores = [];
    
    history.forEach(h => {
        const doc = `Dr. ${h.replacementDoctorName || h.replacementDoctorId}`;
        replacementsMap[doc] = (replacementsMap[doc] || 0) + 1;
        scores.push(h.fairnessScore);
    });

    const averageScore = scores.length > 0 ? (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : 0;
    
    const sortedReplacements = Object.entries(replacementsMap).sort((a,b) => b[1] - a[1]);
    const maxReplacements = sortedReplacements.length > 0 ? sortedReplacements[0][1] : 1;

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1>Fairness Analytics</h1>
                    <p>Monitor emergency workload distribution and fairness metrics</p>
                </div>
            </header>

            {history.length === 0 ? (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <h2>Insufficient Data</h2>
                    <p>There are no emergency allocations recorded yet to analyze.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    
                    {/* Distribution Chart */}
                    <div className="editorial-panel">
                        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-1)', fontFamily: 'var(--font-heading)' }}>Emergency Assignment Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {sortedReplacements.map(([doc, count]) => (
                                <div key={doc}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-1)' }}>
                                        <span>{doc}</span>
                                        <span style={{ color: 'var(--color-4)' }}>{count} assignment{count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / maxReplacements) * 100}%` }}
                                            transition={{ duration: 0.8 }}
                                            style={{ height: '100%', background: 'var(--color-4)', borderRadius: '3px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metrics Panel */}
                    <div className="editorial-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-1)', fontFamily: 'var(--font-heading)', alignSelf: 'flex-start' }}>System Fairness Score</h3>
                        
                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px solid var(--color-6)', borderRadius: '50%', width: '180px', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--color-6)' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--color-4)', lineHeight: 1 }}>
                                {averageScore}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-2)', fontWeight: 700, letterSpacing: '1px', marginTop: '0.4rem', textTransform: 'uppercase' }}>
                                Avg Score
                            </div>
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '280px', margin: 0, lineHeight: 1.6 }}>
                            Higher score = better workload distribution across the emergency replacement pool.
                        </p>
                    </div>

                </div>
            )}
        </motion.div>
    );
}
