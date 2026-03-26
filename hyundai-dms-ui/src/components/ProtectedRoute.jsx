import { Navigate } from 'react-router-dom';

/**
 * Decodes the JWT payload (middle segment) and returns the exp field.
 * Returns 0 if decoding fails — which will force a redirect to login.
 */
const getTokenExpiry = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return 0;
        const payload = JSON.parse(atob(parts[1]));
        return payload.exp || 0;
    } catch {
        return 0;
    }
};

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // No token at all — send to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Token exists but has expired client-side
    const exp = getTokenExpiry(token);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (exp > 0 && nowInSeconds >= exp) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    // Token exists but wrong role — send to login
    if (role && userRole !== role) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;