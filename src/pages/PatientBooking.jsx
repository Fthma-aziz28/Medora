window.PatientBooking = function PatientBooking() {
    const [deptId, setDeptId] = React.useState(null);
    const [docId, setDocId] = React.useState(null);
    const date = '2026-09-21'; // Fixed for prototype simplicity

    // Force re-render on booking
    const [refresh, setRefresh] = React.useState(0);
    React.useEffect(() => {
        const unsubscribe = window.StoreUtils.subscribe(() => setRefresh(r => r+1));
        return unsubscribe;
    }, []);

    const handleBook = (time) => {
        window.StoreUtils.bookAppointment({
            id: 'a' + Date.now(),
            doctorId: docId,
            patientId: 'p_guest',
            patientName: 'Guest Patient',
            date: date,
            time: time,
            endTime: window.SchedulingEngine.minsToTime(window.SchedulingEngine.timeToMins(time) + window.StoreUtils.getDoctor(docId).config.slotMins),
            status: 'Confirmed'
        });
        alert('Appointment Confirmed!');
        setDeptId(null);
        setDocId(null);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontWeight: 300 }}>Find a doctor</h1>

            {!deptId && (
                <div>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 400 }}>Select Department</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {window.MedoraData.departments.map(d => (
                            <div key={d.id} className="event-block" style={{ position: 'relative', height: '100px', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', alignItems: 'center' }} onClick={() => setDeptId(d.id)}>
                                <h3 style={{ margin: 0, fontWeight: 400 }}>{d.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {deptId && !docId && (
                <div className="animate-fade">
                    <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => setDeptId(null)}>
                        <window.Icon name="arrow-left" /> Back
                    </button>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 400 }}>Select Specialist</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {window.StoreUtils.getDocsByDept(deptId).map(doc => (
                            <div key={doc.id} className="event-block" style={{ position: 'relative', height: 'auto', padding: '1.5rem', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} onClick={() => setDocId(doc.id)}>
                                <h3 style={{ margin: 0, fontWeight: 500, color: 'var(--brand-blue)' }}>{doc.name}</h3>
                                <div className="text-meta" style={{ marginTop: '0.5rem' }}>View availability &rarr;</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {docId && (
                <div className="animate-fade">
                    <button className="btn btn-outline" style={{ marginBottom: '2rem' }} onClick={() => setDocId(null)}>
                        <window.Icon name="arrow-left" /> Back
                    </button>
                    
                    <div style={{ marginBottom: '3rem' }}>
                        <h2>{window.StoreUtils.getDoctor(docId).name}</h2>
                        <div className="text-meta">{window.StoreUtils.getDept(deptId).name} • Available Monday, Sep 21</div>
                    </div>

                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 400 }}>Available Slots</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {window.SchedulingEngine.generateSlots(docId, date).map((s, i) => {
                            if (s.type === 'available') {
                                return (
                                    <button key={i} className="btn btn-outline" style={{ justifyContent: 'center', padding: '1rem', color: 'var(--status-available)', borderColor: 'var(--status-available)' }} onClick={() => handleBook(s.time)}>
                                        {s.time}
                                    </button>
                                );
                            } else if (s.type === 'booked') {
                                return (
                                    <div key={i} className="btn" style={{ justifyContent: 'center', padding: '1rem', background: 'var(--bg-main)', color: 'var(--text-tertiary)', cursor: 'not-allowed', textDecoration: 'line-through' }}>
                                        {s.time}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
