import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ Added
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

      // Store everything in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);

      // ✅ Added login timestamp (NEW CHANGE)
      localStorage.setItem('loginTime', Date.now().toString());

      if (dealerStatus) {
        localStorage.setItem('dealerStatus', dealerStatus);
      }

      // ✅ Updated navigation with replace: true (NEW CHANGE)
      if (role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'ROLE_DEALER') {
        navigate('/dealer/dashboard', { replace: true });
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

            {/* ✅ Updated Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--grey-text)',
                    fontSize: '16px',
                    padding: '0',
                    lineHeight: '1'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
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