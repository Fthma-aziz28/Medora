import { createContext, useContext, useState, useEffect } from 'react';

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
        if (token) {
            fetch('http://localhost:8080/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Invalid token");
            })
            .then(data => {
                setUser(data);
                localStorage.setItem('medora_user', JSON.stringify(data));
            })
            .catch(() => {
                localStorage.removeItem('medora_token');
                localStorage.removeItem('medora_user');
                setUser(null);
            })
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Invalid email or password.");
        const data = await res.json();
        localStorage.setItem('medora_token', data.token);
        localStorage.setItem('medora_user', JSON.stringify(data.user));
        setUser(data.user);
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
