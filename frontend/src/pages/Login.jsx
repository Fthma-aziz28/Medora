import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/app/overview');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="brand-side">
                <h1 className="brand-logo">MEDORA</h1>
                <p className="subtitle">Hospital Operations</p>
                <p className="description">Secure access to scheduling, replacements, and analytics.</p>
            </div>
            <div className="form-side">
                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Sign In</h2>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="login-btn">Sign in</button>
                </form>
            </div>
        </div>
    );
}
