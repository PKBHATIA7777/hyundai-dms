import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // No token at all — send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but wrong role — send to login
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — let them through without re-validating
  // The backend will reject expired tokens via 401 naturally
  return children;
};

export default ProtectedRoute;