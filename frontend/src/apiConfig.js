const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8080'
        : '');

export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('medora_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(`API call to ${endpoint} failed:`, error);
        throw error;
    }
}

export { BASE_URL, BASE_URL as API_BASE_URL };
