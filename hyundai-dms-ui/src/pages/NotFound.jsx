import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleGoHome = () => {
        if (role === 'ROLE_ADMIN') {
            navigate('/admin/dashboard');
        } else if (role === 'ROLE_DEALER') {
            navigate('/dealer/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '16px',
            background: 'var(--grey-light)',
            fontFamily: 'inherit'
        }}>
            <div style={{ fontSize: '72px', lineHeight: 1 }}>🚗</div>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: 'var(--purple-main)', margin: 0 }}>
                404
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-mid)', margin: 0 }}>
                Page not found
            </p>
            <p style={{ fontSize: '14px', color: 'var(--grey-text)', margin: 0 }}>
                The page you are looking for does not exist.
            </p>
            <button
                onClick={handleGoHome}
                style={{
                    marginTop: '8px',
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, var(--purple-main), var(--purple-light))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                Go to Dashboard
            </button>
        </div>
    );
};

export default NotFound;