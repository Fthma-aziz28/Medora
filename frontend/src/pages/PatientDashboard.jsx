import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FileText } from 'lucide-react';
import './Dashboard.css';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (user?.email) {
            fetch(`http://localhost:8080/api/documents?patientEmail=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => setDocuments(data))
                .catch(console.error);
        }
    }, [user]);

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Patient Portal</h1>
                <p>View your health summary, documents, and upcoming visits.</p>
            </header>
            
            <div className="metrics-grid">
                <div className="metric-card glass-panel">
                    <h3>Next Appointment</h3>
                    <p className="value" style={{ color: 'var(--color-1)', fontSize: '1.5rem' }}>Oct 12, 10:30 AM</p>
                </div>
                <div className="metric-card glass-panel">
                    <h3>Active Prescriptions</h3>
                    <p className="value" style={{ color: 'var(--color-3)' }}>{documents.filter(d => d.documentType === 'PRESCRIPTION').length || 2}</p>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontFamily: '"Playfair Display", serif' }}>Medical Records & Bills</h2>
                
                {documents.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No records uploaded yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {documents.map(doc => (
                            <div key={doc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <FileText size={28} color="var(--color-4)" />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between' }}>
                                        {doc.title} 
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </h4>
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--color-5)', color: 'var(--color-1)', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        {doc.documentType.replace('_', ' ')}
                                    </span>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{doc.description}</p>
                                    {doc.fileUrl && (
                                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-4)', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
                                            View Attached File &rarr;
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
