import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Download, Clock, Plus, AlertCircle } from 'lucide-react';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { API_BASE_URL } from '../apiConfig';
import './Dashboard.css';

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [downloadingId, setDownloadingId] = useState(null);
    const [nextVisit, setNextVisit] = useState({
        time: 'Loading...',
        detail: 'Fetching clinical schedule...'
    });

    const patientName = user?.name || 'Patient';
    const patientEmail = user?.email || '';

    const fetchPatientData = async () => {
        const token = localStorage.getItem('medora_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // 1. Fetch patient documents (backend automatically scopes to authenticated patient)
        if (API_BASE_URL) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/documents`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setDocuments(data);
                }
            } catch (err) {
                console.warn("Patient documents fetch error:", err);
            }
        }

        // 2. Fetch patient appointments (backend automatically scopes to authenticated patient)
        if (API_BASE_URL) {
            try {
                const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
                if (apptRes.ok) {
                    const myAppts = await apptRes.json();
                    if (Array.isArray(myAppts)) {
                        setPatientAppointments(myAppts);

                        if (myAppts.length > 0) {
                            const sorted = [...myAppts].sort((a, b) => 
                                (a.appointmentDate || '').localeCompare(b.appointmentDate || '')
                            );
                            const next = sorted[0];
                            const timeStr = next.startTime ? next.startTime.substring(0, 5) : '09:00';
                            setNextVisit({
                                time: `${next.appointmentDate} · ${timeStr}`,
                                detail: `With ${next.doctorName || 'Attending Physician'} · Status: ${next.status || 'Confirmed'}`
                            });
                        } else {
                            setNextVisit({
                                time: 'None Scheduled',
                                detail: 'Book a consultation slot above to schedule a visit'
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn("Patient appointments fetch error:", err);
                setNextVisit({
                    time: 'None Scheduled',
                    detail: 'Book a consultation slot above to schedule a visit'
                });
            }
        }
    };

    useEffect(() => {
        fetchPatientData();

        const handleSync = () => fetchPatientData();
        window.addEventListener('medora_appointment_updated', handleSync);
        window.addEventListener('medora_document_updated', handleSync);
        return () => {
            window.removeEventListener('medora_appointment_updated', handleSync);
            window.removeEventListener('medora_document_updated', handleSync);
        };
    }, [patientEmail, patientName]);

    const prescriptions = documents.filter(d => (d.documentType || '').toUpperCase() === 'PRESCRIPTION');
    const prescriptionCount = prescriptions.length;

    const handleDownload = async (doc) => {
        setDownloadingId(doc.id);
        try {
            const token = localStorage.getItem('medora_token');
            const res = await fetch(`${API_BASE_URL}/api/documents/${doc.id}/download`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) {
                throw new Error("Unable to download document from repository.");
            }
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = doc.fileName || `${(doc.title || 'document').replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (err) {
            alert("Download failed: " + err.message);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleAppointmentBooked = (newAppt) => {
        if (newAppt) {
            setNextVisit({
                time: `${newAppt.appointmentDate} · ${newAppt.startTime?.substring(0, 5)}`,
                detail: `With ${newAppt.doctorName || 'Attending Physician'} · ${newAppt.status || 'Confirmed'}`
            });
            setPatientAppointments(prev => [newAppt, ...prev]);
        }
        window.dispatchEvent(new Event('medora_appointment_updated'));
        fetchPatientData();
    };

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
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button 
                        className="btn-secondary-action"
                        onClick={() => navigate('/app/appointments')}
                    >
                        <Calendar size={15} />
                        <span>All Appointments</span>
                    </button>
                    <button 
                        className="btn-primary-action"
                        onClick={() => setIsBookingOpen(true)}
                    >
                        <Plus size={15} />
                        <span>Book Appointment</span>
                    </button>
                </div>
            </header>
            
            {/* Metrics Strip */}
            <section className="metrics-strip">
                <div className="metric-strip-item">
                    <span className="metric-label">Next Scheduled Visit</span>
                    <div className="metric-value" style={{ fontSize: '1.75rem' }}>{nextVisit.time}</div>
                    <span className="metric-subtext">{nextVisit.detail}</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Active Prescriptions</span>
                    <div className="metric-value">{prescriptionCount}</div>
                    <span className="metric-subtext">
                        {prescriptionCount > 0 
                            ? `${prescriptions[0].title} on file`
                            : 'No active prescriptions recorded'}
                    </span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Clinical Records on File</span>
                    <div className="metric-value">{documents.length}</div>
                    <span className="metric-subtext">
                        {documents.length > 0 ? 'Verified by attending clinical staff' : 'No records uploaded yet'}
                    </span>
                </div>
            </section>

            {/* Live Scheduled Appointments Section */}
            <section className="editorial-table-container" style={{ marginBottom: '2rem' }}>
                <div className="editorial-table-header">
                    <div>
                        <h2>Your Active Clinical Appointments</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Confirmed outpatient slots synchronized across physician rosters
                        </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-4)', background: 'var(--color-6)', padding: '0.2rem 0.5rem', borderRadius: 3 }}>
                        {patientAppointments.length} Scheduled
                    </span>
                </div>

                {patientAppointments.length === 0 ? (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>You have no scheduled clinical appointments.</p>
                        <button 
                            className="btn-primary-action" 
                            style={{ margin: '1rem auto 0' }}
                            onClick={() => setIsBookingOpen(true)}
                        >
                            <Plus size={14} /> Schedule an Outpatient Consultation
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="editorial-row editorial-row-header">
                            <div>Attending Physician</div>
                            <div>Date & Scheduled Time</div>
                            <div>Consultation Type</div>
                            <div>Status</div>
                            <div style={{ textAlign: 'right' }}>Actions</div>
                        </div>

                        {patientAppointments.map(a => (
                            <div key={a.id} className="editorial-row">
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-1)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <Clock size={15} color="var(--color-4)" />
                                        <span>{a.doctorName || `Dr. #${a.doctorId}`}</span>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {a.appointmentDate} · {a.startTime?.substring(0, 5)} - {a.endTime?.substring(0, 5)}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                    {a.isEmergencyReplacement ? 'Emergency Physician Reassignment' : 'Outpatient Clinical Consultation'}
                                </div>
                                <div>
                                    <span className="status-indicator-dot confirmed">
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-4)' }} />
                                        {a.status || 'Confirmed'}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button 
                                        className="row-action-btn edit"
                                        onClick={() => navigate('/app/appointments')}
                                    >
                                        <span>Manage</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-4)', background: 'var(--color-6)', padding: '0.2rem 0.5rem', borderRadius: 3 }}>
                        {documents.length} Records
                    </span>
                </div>

                {documents.length === 0 ? (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <FileText size={32} color="var(--color-4)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>No medical records or diagnostic reports on file for your account.</p>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            When clinical documents or prescriptions are issued by attending physicians, they will be securely accessible here.
                        </p>
                    </div>
                ) : (
                    <>
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
                                    {doc.fileName && (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '1.45rem' }}>
                                            {doc.fileName}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'var(--color-6)', color: 'var(--color-4)', borderRadius: '3px', fontWeight: 600, textTransform: 'uppercase' }}>
                                        {(doc.documentType || 'DOCUMENT').replace('_', ' ')}
                                    </span>
                                </div>

                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                    {doc.description || 'Clinical document issued by attending physician.'}
                                </div>

                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <button 
                                        className="row-action-btn edit"
                                        onClick={() => handleDownload(doc)}
                                        disabled={downloadingId === doc.id}
                                    >
                                        <Download size={13} />
                                        <span>{downloadingId === doc.id ? 'Downloading...' : 'Download'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </section>

            <AddAppointmentModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                onUpdated={handleAppointmentBooked}
            />
        </motion.div>
    );
}
