import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DealerLayout.css';

const DealerLayout = ({ children }) => {
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
    <div className="dealer-layout">
      <aside className={`dealer-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          {!collapsed && <span className="brand-text">DMS Dealer</span>}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dealer/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">▣</span>
            {!collapsed && <span className="nav-label">Dashboard</span>}
          </NavLink>

          <NavLink to="/dealer/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">▦</span>
            {!collapsed && <span className="nav-label">Inventory</span>}
          </NavLink>

          {/* ✅ NEW LEADS NAV ITEM */}
          <NavLink to="/dealer/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">◎</span>
            {!collapsed && <span className="nav-label">Leads</span>}
          </NavLink>


          <NavLink to="/dealer/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">✦</span>
    {!collapsed && <span className="nav-label">Bookings</span>}
</NavLink>

          <NavLink to="/dealer/stock-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">↑</span>
            {!collapsed && <span className="nav-label">Request Stock</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">⇥</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`dealer-main-wrapper ${collapsed ? 'collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="page-title">Dealer Panel</h2>
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

export default DealerLayout;