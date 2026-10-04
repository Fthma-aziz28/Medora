window.ScheduleViewer = function ScheduleViewer() {
    const [date, setDate] = React.useState('2026-09-21');
    const [docId, setDocId] = React.useState('doc1');
    const [refresh, setRefresh] = React.useState(0);
    const [leaveAction, setLeaveAction] = React.useState(false);

    // Re-render when store updates
    React.useEffect(() => {
        const unsubscribe = window.StoreUtils.subscribe(() => setRefresh(r => r + 1));
        return unsubscribe;
    }, []);

    const slots = window.SchedulingEngine.generateSlots(docId, date);
    const doc = window.StoreUtils.getDoctor(docId);
    
    // For Leave simulation
    const affected = window.SchedulingEngine.getAffectedAppointments(docId, date);
    const replacements = affected.length > 0 ? window.SchedulingEngine.findReplacements(docId, date, affected[0].time) : [];

    const handleLeave = () => {
        window.StoreUtils.addLeave(docId, date);
        setLeaveAction(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: 400 }}>Schedule</h1>
                <p className="text-meta" style={{ fontSize: '1rem' }}>Your hospital's appointments, duties and availability in one place.</p>
            </div>

            {leaveAction && affected.length > 0 && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <window.Icon name="alert-circle" style={{ color: 'var(--status-warning)' }} />
                        <h3 style={{ margin: 0 }}>{affected.length} appointments affected by leave</h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <div className="text-label" style={{ marginBottom: '0.5rem' }}>Affected Patients</div>
                            {affected.map(a => <div key={a.id} className="text-meta">{a.time} - {a.patientName}</div>)}
                        </div>
                        <div>
                            <div className="text-label" style={{ marginBottom: '0.5rem' }}>Eligible Replacements</div>
                            {replacements.map(r => (
                                <div key={r.doctor.id} className="text-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {r.eligible ? <span style={{color: 'var(--status-available)'}}>✓</span> : <span style={{color: 'var(--status-error)'}}>✕</span>}
                                    {r.doctor.name} <span style={{ opacity: 0.5 }}>({r.reason})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="calendar-workspace">
                <div className="calendar-header">
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><window.Icon name="chevron-left" /></button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>Today</button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><window.Icon name="chevron-right" /></button>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="select-wrapper">
                            <select className="form-select" value={docId} onChange={e => setDocId(e.target.value)}>
                                {window.MedoraData.doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({window.StoreUtils.getDept(d.departmentId).name})</option>)}
                            </select>
                        </div>
                        <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                        
                        <button className="btn btn-outline" onClick={handleLeave} title="Simulate adding leave">
                            <window.Icon name="clock" /> Put on Leave
                        </button>
                    </div>
                </div>

                <div className="calendar-body">
                    {slots.length > 0 && (slots[0].type === 'unavailable' || slots[0].type === 'leave') ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            <window.Icon name="moon" style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
                            <h2>{slots[0].reason}</h2>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', position: 'relative', minHeight: '800px' }}>
                            <div style={{ width: '80px', borderRight: '1px solid var(--border-subtle)' }}>
                                {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} className="time-axis" style={{ height: '60px' }}>
                                        {i + 8}:00
                                    </div>
                                ))}
                            </div>
                            
                            <div className="events-area">
                                {Array.from({length: 12}).map((_, i) => (
                                    <div key={i} style={{ height: '60px', borderBottom: '1px solid var(--border-subtle)', opacity: 0.5 }}></div>
                                ))}
                                
                                {slots.map((s, idx) => {
                                    const top = ((window.SchedulingEngine.timeToMins(s.time) - 480) / 60) * 60;
                                    const height = ((window.SchedulingEngine.timeToMins(s.endTime) - window.SchedulingEngine.timeToMins(s.time)) / 60) * 60;
                                    
                                    let cssClass = 'event-available';
                                    let content = <div style={{fontWeight: 500}}>Available</div>;
                                    
                                    if (s.type === 'booked') {
                                        cssClass = 'event-booked';
                                        content = <div><div style={{fontWeight: 500}}>Patient Consultation</div><div className="text-meta" style={{color:'inherit', opacity:0.8}}>{s.appointment.patientName}</div></div>;
                                    } else if (s.type === 'break') {
                                        cssClass = 'event-break';
                                        content = <div>{s.label.toUpperCase()}</div>;
                                    }

                                    return (
                                        <div key={idx} className={`event-block ${cssClass}`} style={{ top: `${top}px`, height: `${height - 2}px` }}>
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
