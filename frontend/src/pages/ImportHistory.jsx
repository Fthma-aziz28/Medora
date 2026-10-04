import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function ImportHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch('http://localhost:8080/api/doctors/import/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to load import history", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--color-3)' }}>Loading import history...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>Batch Ingestion Audit History</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Chronological record of physician datasets uploaded and processed via transactional JDBC.
                    </p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--color-3)' }}>
                    <FileText size={36} color="var(--color-4)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
                    <h3 style={{ margin: 0, color: 'var(--color-1)', fontFamily: '"Playfair Display", serif' }}>No Import Operations Found</h3>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload an Excel or CSV file in the "Import Doctors" tab to populate this ledger.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
                    <table className="dc-table">
                        <thead>
                            <tr>
                                <th>Import ID</th>
                                <th>Dataset File</th>
                                <th>Imported By</th>
                                <th>Execution Date</th>
                                <th>Total Rows</th>
                                <th>Imported</th>
                                <th>Skipped</th>
                                <th>Failed</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--color-3)' }}>#{item.id}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-1)' }}>{item.filename}</td>
                                    <td style={{ color: 'var(--color-2)' }}>{item.importedBy}</td>
                                    <td style={{ color: 'var(--color-3)', fontSize: '0.85rem' }}>
                                        {item.date ? new Date(item.date).toLocaleString() : 'Recent'}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-1)' }}>{item.totalRecords}</td>
                                    <td style={{ color: 'var(--color-4)', fontWeight: 700 }}>{item.imported}</td>
                                    <td style={{ color: '#d97706', fontWeight: 600 }}>{item.skipped}</td>
                                    <td style={{ color: item.failed > 0 ? '#b91c1c' : 'var(--color-3)' }}>{item.failed}</td>
                                    <td>
                                        <span className={`status-tag ${item.status?.toLowerCase() === 'success' ? 'success' : item.status?.toLowerCase() === 'failed' ? 'failed' : 'pending'}`}>
                                            {item.status || 'SUCCESS'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
