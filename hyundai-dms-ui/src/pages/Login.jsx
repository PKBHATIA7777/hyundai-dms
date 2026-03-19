import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', credentials);
      const { token, role, username, email, dealerStatus } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      if (dealerStatus) {
        localStorage.setItem('dealerStatus', dealerStatus);
      }

      if (role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'ROLE_DEALER') {
        navigate('/dealer/dashboard');
      }

    } catch (err) {
      setError(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">DMS</div>
          <h1>Dealer Management System</h1>
          <p>Streamline your dealership operations with precision and efficiency.</p>
        </div>
        <div className="login-features">
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Real-time inventory tracking</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Nationwide dealer network</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot" />
            <span>Complete sales pipeline</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? <span className="btn-loader" /> : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            Hyundai Dealer Management System &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;