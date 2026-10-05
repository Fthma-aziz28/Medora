import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Download, Clock } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './Dashboard.css';

const DEMO_PATIENT_DOCUMENTS = [
    {
        id: 1,
        title: 'Comprehensive Metabolic Panel (CMP)',
        documentType: 'TEST_RESULT',
        description: 'Routine blood panel shows electrolytes and liver enzymes within normal parameters.',
        createdAt: new Date().toISOString(),
        fileUrl: ''
    },
    {
        id: 2,
        title: 'Prescription: Lisinopril 10mg',
        documentType: 'PRESCRIPTION',
        description: 'Take 1 tablet daily every morning with water. 90-day refill authorized by Dr. Aisha Rahman.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        fileUrl: ''
    },
    {
        id: 3,
        title: 'Cardiology Consultation & ECG Report',
        documentType: 'TEST_RESULT',
        description: 'Normal sinus rhythm, heart rate 72 bpm. Follow-up scheduled in 6 months.',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        fileUrl: ''
    }
];

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState(DEMO_PATIENT_DOCUMENTS);
    const patientName = user?.name || 'Emily Chen';
    const patientEmail = user?.email || 'emily@medora.com';

    useEffect(() => {
        if (patientEmail) {
            const token = localStorage.getItem('medora_token');
            fetch(`${API_BASE_URL}/api/documents?patientEmail=${encodeURIComponent(patientEmail)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to fetch documents');
                })
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setDocuments(data);
                    }
                })
                .catch(err => {
                    console.warn("Using demo documents fallback for patient:", err);
                });
        }
    }, [patientEmail]);

    const prescriptionCount = documents.filter(d => d.documentType === 'PRESCRIPTION').length || 1;

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <div className="system-eyebrow">Patient Portal · Health Records</div>
                    <h1>Patient Portal</h1>
                    <div className="header-desc">
                        Welcome, {patientName} ({patientEmail}) · Personal clinical summary, active prescriptions, and diagnostic documents
                    </div>
                </div>
                <div>
                    <button 
                        className="btn-primary-action"
                        onClick={() => navigate('/app/appointments')}
                    >
                        <Calendar size={15} />
                        <span>Book Appointment</span>
                    </button>
                </div>
            </header>
            
            {/* Metrics Strip */}
            <section className="metrics-strip">
                <div className="metric-strip-item">
                    <span className="metric-label">Next Scheduled Visit</span>
                    <div className="metric-value" style={{ fontSize: '2.1rem' }}>Today 09:00</div>
                    <span className="metric-subtext">Dr. Aisha Rahman · Cardiology Room 302</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Active Prescriptions</span>
                    <div className="metric-value">{prescriptionCount}</div>
                    <span className="metric-subtext">Lisinopril 10mg (90-day supply active)</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Clinical Records on File</span>
                    <div className="metric-value">{documents.length}</div>
                    <span className="metric-subtext">All verified by attending physicians</span>
                </div>
            </section>

            {/* Medical Records Table */}
            <section className="editorial-table-container">
                <div className="editorial-table-header">
                    <div>
                        <h2>Medical Records & Diagnostic Reports</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Official clinical documents, lab findings, and pharmacy authorizations
                        </span>
                    </div>
                </div>

                <div className="editorial-row editorial-row-header">
                    <div>Document Name</div>
                    <div>Category</div>
                    <div>Clinical Summary</div>
                    <div>Date</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                </div>

                {documents.map(doc => (
                    <div key={doc.id} className="editorial-row">
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-1)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <FileText size={16} color="var(--color-4)" />
                                <span>{doc.title}</span>
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'var(--color-6)', color: 'var(--color-4)', borderRadius: '3px', fontWeight: 600, textTransform: 'uppercase' }}>
                                {doc.documentType.replace('_', ' ')}
                            </span>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {doc.description}
                        </div>

                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {new Date(doc.createdAt).toLocaleDateString()}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button 
                                className="row-action-btn edit"
                                onClick={() => alert(`Downloading ${doc.title}...`)}
                            >
                                <Download size={13} />
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                ))}
            </section>
        </motion.div>
    );
}
