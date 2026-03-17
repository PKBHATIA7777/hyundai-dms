import { useState } from 'react';
import api from '../services/api';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', credentials);
            // Save the token from your JwtResponse DTO
            localStorage.setItem('token', response.data.token);
            setMessage(`Login Successful! Welcome, ${response.data.username}`);
            console.log("JWT Received:", response.data.token);
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.message || "Check Console"));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '300px' }}>
            <h2>Hyundai DMS Login</h2>
            <form onSubmit={handleLogin}>
                <input name="username" placeholder="Username" onChange={handleChange} block style={{display:'block', marginBottom:'10px'}} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} style={{display:'block', marginBottom:'10px'}} />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;