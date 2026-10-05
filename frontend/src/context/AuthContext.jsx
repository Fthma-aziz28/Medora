import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('medora_user');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        const token = localStorage.getItem('medora_token');
        if (token && API_BASE_URL) {
            fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (res.ok) return res.json();
                if (res.status === 401) {
                    localStorage.removeItem('medora_token');
                    localStorage.removeItem('medora_user');
                    setUser(null);
                }
                return null;
            })
            .then(data => {
                if (data) {
                    setUser(data);
                    localStorage.setItem('medora_user', JSON.stringify(data));
                }
            })
            .catch(err => {
                console.warn("Backend /api/auth/me unreachable, maintaining session:", err);
            })
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        
        // 1. Try real backend if available
        if (API_BASE_URL) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('medora_token', data.token);
                    localStorage.setItem('medora_user', JSON.stringify(data.user));
                    setUser(data.user);
                    return data.user;
                }
                if (res.status === 401 || res.status === 400) {
                    throw new Error("Invalid email or password.");
                }
            } catch (err) {
                if (err.message === "Invalid email or password.") {
                    throw err;
                }
                console.warn("Backend server unreachable, activating seamless demo login:", err);
            }
        }

        // 2. Fallback for Vercel Cloud / Mobile Deployment:
        let role = 'ADMIN';
        let name = 'Dr. Admin';

        if (cleanEmail.includes('doctor') || cleanEmail.includes('aisha')) {
            role = 'DOCTOR';
            name = 'Dr. Aisha Rahman';
        } else if (cleanEmail.includes('patient') || cleanEmail.includes('chen') || cleanEmail.includes('emily')) {
            role = 'PATIENT';
            name = 'Emily Chen';
        } else if (cleanEmail.includes('admin')) {
            role = 'ADMIN';
            name = 'Hospital Administrator';
        }

        const demoUser = {
            id: role === 'ADMIN' ? 1 : (role === 'DOCTOR' ? 2 : 3),
            name,
            email: email ? email.trim() : (role === 'PATIENT' ? 'emily@medora.com' : `${role.toLowerCase()}@medora.com`),
            role
        };

        const demoToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('medora_token', demoToken);
        localStorage.setItem('medora_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return demoUser;
    };

    const logout = () => {
        localStorage.removeItem('medora_token');
        localStorage.removeItem('medora_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
