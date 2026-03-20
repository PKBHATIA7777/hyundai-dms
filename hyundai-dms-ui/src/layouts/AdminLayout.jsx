import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          {!collapsed && <span className="brand-text">DMS Admin</span>}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">▣</span>
            {!collapsed && <span className="nav-label">Dashboard</span>}
          </NavLink>

          <NavLink to="/admin/dealers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">◈</span>
            {!collapsed && <span className="nav-label">Dealers</span>}
          </NavLink>

          <NavLink to="/admin/cars" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">◉</span>
            {!collapsed && <span className="nav-label">Car Catalogue</span>}
          </NavLink>

          <NavLink to="/admin/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">▦</span>
            {!collapsed && <span className="nav-label">Inventory</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">⇥</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="page-title">Admin Panel</h2>
          </div>
          <div className="topbar-right">
            <div className="user-badge">
              <div className="user-avatar">{username?.charAt(0).toUpperCase()}</div>
              <span className="user-name">{username}</span>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;