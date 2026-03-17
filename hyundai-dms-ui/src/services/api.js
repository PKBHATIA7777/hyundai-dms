import axios from 'axios';

// Creating a classical Axios instance
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Matches your Spring Boot port
});

// Interceptor to manually add the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Standard "Bearer" token format for Spring Security
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;