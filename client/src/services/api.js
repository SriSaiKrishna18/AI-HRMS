import axios from 'axios';

// Auto-detect production: if not localhost, use Render backend directly
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const baseURL = isProduction
    ? 'https://ai-hrms-50sy.onrender.com/api'
    : '/api';

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
});

// JWT interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('org');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
