import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Stethoscope, User, ArrowRight, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';
import './Login.css';

export default function Login() {
    const [tab, setTab] = useState('staff');           // 'staff' | 'patient'
    const [patientMode, setPatientMode] = useState('login');  // 'login' | 'register'

    // Shared fields
    const [email, setEmail] = useState('admin@medora.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Patient registration fields
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // ── Staff / Doctor login ────────────────────────────────────────────────────

    const handleLogin = async (loginEmail, loginPassword) => {
        setError('');
        setIsSubmitting(true);
        try {
            await login(loginEmail, loginPassword);
            navigate('/app/overview');
        } catch (err) {
            setError(err.message || 'Sign in failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    const handleQuickLogin = async (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        await handleLogin(demoEmail, demoPass);
    };

    // ── Patient login ───────────────────────────────────────────────────────────

    const handlePatientLogin = async (e) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    // ── Patient registration ────────────────────────────────────────────────────

    const handlePatientRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (regPassword !== regConfirm) {
            setError('Passwords do not match.');
            return;
        }
        if (regPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (API_BASE_URL) {
                const res = await fetch(`${API_BASE_URL}/api/auth/register-patient`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Registration failed.');
                }
                // Auto-login with returned token
                if (data.token && data.user) {
                    localStorage.setItem('medora_token', data.token);
                    localStorage.setItem('medora_user', JSON.stringify(data.user));
                    navigate('/app/overview');
                    return;
                }
            }
            // Demo mode — no backend, log in by email pattern
            await handleLogin(regEmail, regPassword);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <div className="login-container">
            <div className="brand-side">
                <h1 className="brand-logo">MEDORA</h1>
                <p className="subtitle">Hospital Operations System</p>
                <p className="description">
                    Dynamic physician availability, fair emergency slot allocation, and departmental scheduling.
                </p>
                <div className="brand-feature-list">
                    <div className="brand-feature-item">
                        <span className="feature-bullet">•</span>
                        <span>Fair Emergency Slot Replacement Engine</span>
                    </div>
                    <div className="brand-feature-item">
                        <span className="feature-bullet">•</span>
                        <span>Automated Bulk Ingestion &amp; Verification</span>
                    </div>
                    <div className="brand-feature-item">
                        <span className="feature-bullet">•</span>
                        <span>Real-time Dynamic Duty Rostering</span>
                    </div>
                </div>
            </div>

            <div className="form-side">
                <div className="login-card">

                    {/* Portal tab strip */}
                    <div className="portal-tabs">
                        <button
                            type="button"
                            className={`portal-tab ${tab === 'staff' ? 'active' : ''}`}
                            onClick={() => { setTab('staff'); setError(''); setEmail('admin@medora.com'); setPassword('password'); }}
                        >
                            <Shield size={15} /> Staff Portal
                        </button>
                        <button
                            type="button"
                            className={`portal-tab ${tab === 'patient' ? 'active' : ''}`}
                            onClick={() => { setTab('patient'); setError(''); setEmail('emily@medora.com'); setPassword('password'); }}
                        >
                            <User size={15} /> Patient Portal
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {/* ── STAFF / DOCTOR TAB ─────────────────────────────────── */}
                    {tab === 'staff' && (
                        <>
                            <form onSubmit={handleStaffSubmit} className="login-form">
                                <h2>Hospital Portal Sign In</h2>
                                <p className="login-subtext">Enter credentials or choose a quick demo role below.</p>

                                <div className="form-group">
                                    <label>Staff / Physician Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="name@medora.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button type="submit" className="login-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="demo-credentials-section">
                                <div className="demo-divider">
                                    <span>OR INSTANT DEMO ACCESS</span>
                                </div>
                                <div className="demo-btn-grid">
                                    <button type="button" className="demo-role-btn admin"
                                        onClick={() => handleQuickLogin('admin@medora.com', 'password')}
                                        disabled={isSubmitting}>
                                        <Shield size={16} />
                                        <div>
                                            <div className="role-name">Administrator</div>
                                            <div className="role-desc">Full Operations &amp; Data Center</div>
                                        </div>
                                    </button>
                                    <button type="button" className="demo-role-btn doctor"
                                        onClick={() => handleQuickLogin('aisha@medora.com', 'password')}
                                        disabled={isSubmitting}>
                                        <Stethoscope size={16} />
                                        <div>
                                            <div className="role-name">Doctor</div>
                                            <div className="role-desc">Duty Roster &amp; Leave Requests</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── PATIENT TAB ────────────────────────────────────────── */}
                    {tab === 'patient' && (
                        <>
                            {/* Sub-tab: Login / Register */}
                            <div className="patient-subtabs">
                                <button
                                    type="button"
                                    className={`patient-subtab ${patientMode === 'login' ? 'active' : ''}`}
                                    onClick={() => { setPatientMode('login'); setError(''); }}
                                >
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    className={`patient-subtab ${patientMode === 'register' ? 'active' : ''}`}
                                    onClick={() => { setPatientMode('register'); setError(''); }}
                                >
                                    New Patient
                                </button>
                            </div>

                            {patientMode === 'login' ? (
                                <>
                                    <form onSubmit={handlePatientLogin} className="login-form">
                                        <h2>Patient Portal</h2>
                                        <p className="login-subtext">Sign in to view your appointments and medical records.</p>

                                        <div className="form-group">
                                            <label>Patient Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="login-btn" disabled={isSubmitting}>
                                            {isSubmitting ? 'Signing in...' : 'Access My Records'} <ArrowRight size={16} />
                                        </button>
                                    </form>

                                    <div className="demo-credentials-section">
                                        <div className="demo-divider"><span>DEMO PATIENT</span></div>
                                        <div className="demo-btn-grid">
                                            <button type="button" className="demo-role-btn patient"
                                                onClick={() => handleQuickLogin('emily@medora.com', 'password')}
                                                disabled={isSubmitting}>
                                                <User size={16} />
                                                <div>
                                                    <div className="role-name">Emily Chen</div>
                                                    <div className="role-desc">emily@medora.com</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handlePatientRegister} className="login-form">
                                    <h2>Create Patient Account</h2>
                                    <p className="login-subtext">Register to access your appointment history and health records.</p>

                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={regName}
                                            onChange={e => setRegName(e.target.value)}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={regEmail}
                                            onChange={e => setRegEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            value={regPassword}
                                            onChange={e => setRegPassword(e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            value={regConfirm}
                                            onChange={e => setRegConfirm(e.target.value)}
                                            placeholder="Repeat password"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="login-btn" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating account...' : 'Create My Account'} <UserPlus size={16} />
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
