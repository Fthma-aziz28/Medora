import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Download, Clock, Plus } from 'lucide-react';
import AddAppointmentModal from '../components/AddAppointmentModal';
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
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [nextVisit, setNextVisit] = useState({
        time: 'Loading...',
        detail: 'Fetching clinical schedule...'
    });

    const patientName = user?.name || 'Emily Chen';
    const patientEmail = user?.email || 'emily@medora.com';

    const fetchPatientData = async () => {
        const token = localStorage.getItem('medora_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // 1. Fetch patient documents
        if (patientEmail && API_BASE_URL) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/documents?patientEmail=${encodeURIComponent(patientEmail)}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) setDocuments(data);
                }
            } catch (err) {
                console.warn("Using demo documents fallback for patient:", err);
            }
        }

        // 2. Fetch patient appointments
        if (API_BASE_URL) {
            try {
                const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
                if (apptRes.ok) {
                    const allAppts = await apptRes.json();
                    if (Array.isArray(allAppts)) {
                        const myAppts = allAppts.filter(a => {
                            const pName = (a.patientName || '').toLowerCase();
                            return pName.includes(patientName.toLowerCase()) || pName.includes('emily');
                        });
                        setPatientAppointments(myAppts);

                        if (myAppts.length > 0) {
                            // Find next upcoming
                            const sorted = [...myAppts].sort((a, b) => 
                                (a.appointmentDate || '').localeCompare(b.appointmentDate || '')
                            );
                            const next = sorted[0];
                            const timeStr = next.startTime ? next.startTime.substring(0, 5) : '09:00';
                            setNextVisit({
                                time: `${next.appointmentDate} · ${timeStr}`,
                                detail: `With ${next.doctorName || 'Dr. Aisha Rahman'} · Status: ${next.status || 'Confirmed'}`
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
                console.warn("Using fallback appointments for patient:", err);
                setNextVisit({
                    time: 'Today 09:00',
                    detail: 'Dr. Aisha Rahman · Cardiology Room 302'
                });
            }
        }
    };

    useEffect(() => {
        fetchPatientData();

        const handleSync = () => fetchPatientData();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, [patientEmail, patientName]);

    const prescriptionCount = documents.filter(d => d.documentType === 'PRESCRIPTION').length || 1;

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
                    <span className="metric-subtext">Lisinopril 10mg (90-day supply active)</span>
                </div>

                <div className="metric-strip-item">
                    <span className="metric-label">Clinical Records on File</span>
                    <div className="metric-value">{documents.length}</div>
                    <span className="metric-subtext">All verified by attending physicians</span>
                </div>
            </section>

            {/* Live Scheduled Appointments Section */}
            {patientAppointments.length > 0 && (
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
                                Outpatient Clinical Consultation
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
                </section>
            )}

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

            <AddAppointmentModal 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                onUpdated={handleAppointmentBooked}
            />
        </motion.div>
    );
}
