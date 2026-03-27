import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Request interceptor — add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
// Only redirect to login if it is a 401 on an auth-required endpoint
// Do NOT redirect on every 401 — that kills sessions aggressively
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';

        // Only force logout if token is truly invalid or expired
        // Not on stock-request approve/reject 400 errors etc.
        if (status === 401 && !url.includes('/auth/login')) {
            localStorage.clear();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;