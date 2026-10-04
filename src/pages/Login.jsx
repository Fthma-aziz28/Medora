window.Login = function Login({ onLogin }) {
    // No feather replace

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div style={{ background: 'var(--bg-card)', padding: '4rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', width: '100%', maxWidth: '440px', textAlign: 'center' }}>
                <div style={{ color: 'var(--brand-blue)', marginBottom: '2rem' }}>
                    <window.Icon name="activity" style={{ width: '48px', height: '48px' }} />
                </div>
                <h2 style={{ fontWeight: 300, marginBottom: '0.5rem' }}>MEDORA</h2>
                <p className="text-meta" style={{ marginBottom: '3rem' }}>Sign in to the hospital network.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center' }} onClick={() => onLogin('admin')}>
                        Administrator Access
                    </button>
                    <button className="btn btn-outline" style={{ padding: '1rem', justifyContent: 'center' }} onClick={() => onLogin('doctor')}>
                        Doctor Portal
                    </button>
                    <button className="btn btn-outline" style={{ padding: '1rem', justifyContent: 'center' }} onClick={() => onLogin('patient')}>
                        Patient Booking
                    </button>
                </div>
            </div>
        </div>
    );
};
