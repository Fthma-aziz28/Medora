import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse glass cards

export default function DoctorDashboard() {
    const navigate = useNavigate();
    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header">
                <h1 style={{ fontFamily: '"Playfair Display", serif' }}>Doctor Portal</h1>
                <p>Manage your upcoming shifts and patient consultations.</p>
            </header>
            
            <div className="metrics-grid">
                <div className="metric-card glass-panel clickable-metric" onClick={() => navigate('/app/appointments')} style={{ cursor: 'pointer' }}>
                    <h3>Today's Appointments</h3>
                    <p className="value" style={{ color: 'var(--color-1)' }}>8</p>
                </div>
                <div className="metric-card glass-panel clickable-metric" onClick={() => navigate('/app/roster')} style={{ cursor: 'pointer' }}>
                    <h3>Upcoming Shifts</h3>
                    <p className="value" style={{ color: 'var(--color-3)' }}>4</p>
                </div>
                <div className="metric-card glass-panel clickable-metric" onClick={() => navigate('/app/appointments')} style={{ cursor: 'pointer' }}>
                    <h3>Pending Labs</h3>
                    <p className="value" style={{ color: 'var(--color-4)' }}>12</p>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontFamily: '"Playfair Display", serif' }}>Your Schedule</h2>
                <p>You are scheduled for the Cardiology Ward this week.</p>
                {/* Doctor specific detailed view could go here */}
            </div>
        </motion.div>
    );
}
