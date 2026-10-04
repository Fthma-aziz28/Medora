import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Dashboard.css';

export default function FairnessAnalytics() {
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
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Fairness Analytics</h1>
                <p>Monitor emergency workload distribution and fairness metrics</p>
            </header>

            {history.length === 0 ? (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <h2>Insufficient Data</h2>
                    <p>There are no emergency allocations recorded yet to analyze.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    
                    {/* Distribution Chart */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0' }}>Emergency Assignment Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {sortedReplacements.map(([doc, count]) => (
                                <div key={doc}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        <span>{doc}</span>
                                        <span>{count} assignments</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / maxReplacements) * 100}%` }}
                                            transition={{ duration: 1 }}
                                            style={{ height: '100%', background: 'var(--primary-color)' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metrics Panel */}
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', alignSelf: 'flex-start' }}>System Fairness Trend</h3>
                        
                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px solid rgba(0,0,0,0.05)', borderRadius: '50%', width: '200px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#27ae60', lineHeight: 1 }}>
                                {averageScore}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginTop: '0.5rem' }}>
                                AVERAGE SCORE
                            </div>
                        </div>

                        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                            This score represents the average fairness of all emergency replacements made in the system. A higher score indicates better workload distribution.
                        </p>
                    </div>

                </div>
            )}
        </motion.div>
    );
}
