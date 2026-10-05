import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Stethoscope, User, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('admin@medora.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(email, password);
    };

    const handleQuickLogin = async (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        await handleLogin(demoEmail, demoPass);
    };

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
                        <span>Automated Bulk Ingestion & Verification</span>
                    </div>
                    <div className="brand-feature-item">
                        <span className="feature-bullet">•</span>
                        <span>Real-time Dynamic Duty Rostering</span>
                    </div>
                </div>
            </div>

            <div className="form-side">
                <div className="login-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <h2>Hospital Portal Sign In</h2>
                        <p className="login-subtext">Enter credentials or choose a quick demo role below.</p>
                        
                        {error && <div className="error-message">{error}</div>}
                        
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

                    {/* Quick Demo Access Buttons for Mobile & Cloud Testing */}
                    <div className="demo-credentials-section">
                        <div className="demo-divider">
                            <span>OR INSTANT DEMO ACCESS</span>
                        </div>

                        <div className="demo-btn-grid">
                            <button 
                                type="button" 
                                className="demo-role-btn admin"
                                onClick={() => handleQuickLogin('admin@medora.com', 'password')}
                                disabled={isSubmitting}
                            >
                                <Shield size={16} />
                                <div>
                                    <div className="role-name">Administrator</div>
                                    <div className="role-desc">Full Operations & Data Center</div>
                                </div>
                            </button>

                            <button 
                                type="button" 
                                className="demo-role-btn doctor"
                                onClick={() => handleQuickLogin('aisha@medora.com', 'password')}
                                disabled={isSubmitting}
                            >
                                <Stethoscope size={16} />
                                <div>
                                    <div className="role-name">Doctor</div>
                                    <div className="role-desc">Duty Roster & Leave Requests</div>
                                </div>
                            </button>

                            <button 
                                type="button" 
                                className="demo-role-btn patient"
                                onClick={() => handleQuickLogin('emily@medora.com', 'password')}
                                disabled={isSubmitting}
                            >
                                <User size={16} />
                                <div>
                                    <div className="role-name">Patient</div>
                                    <div className="role-desc">emily@medora.com</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
