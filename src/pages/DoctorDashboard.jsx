window.DoctorDashboard = function DoctorDashboard() {
    const docId = window.MedoraData.currentUser?.id || 'doc1';
    const date = '2026-09-21';
    const doc = window.StoreUtils.getDoctor(docId);
    const slots = window.SchedulingEngine.generateSlots(docId, date);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontWeight: 400 }}>Good morning, {doc?.name}.</h1>
                <p className="text-subtitle" style={{ color: 'var(--text-primary)' }}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {slots.map((s, i) => {
                    if (s.type === 'unavailable' || s.type === 'leave') return null;
                    if (s.type === 'break') {
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                                <div style={{ width: '80px', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>{s.time}</div>
                                <div style={{ flex: 1, padding: '1rem', borderLeft: '2px solid var(--border-subtle)' }}>{s.label}</div>
                            </div>
                        );
                    }
                    if (s.type === 'booked') {
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '80px', textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>{s.time}</div>
                                <div style={{ flex: 1, padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', borderLeft: '4px solid var(--brand-blue)', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Patient Consultation</div>
                                        <div className="text-meta">{s.appointment.patientName}</div>
                                    </div>
                                    <span className="status-indicator status-confirmed">Confirmed</span>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '80px', textAlign: 'right', fontWeight: 500, color: 'var(--text-tertiary)' }}>{s.time}</div>
                            <div style={{ flex: 1, padding: '1rem', color: 'var(--status-available)' }}>Available</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
