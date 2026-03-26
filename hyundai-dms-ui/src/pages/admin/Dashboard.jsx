import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  getAdminStats,
  getDealerPerformance,
  getAdminMonthlyRevenue,
  getAdminRecentSales
} from '../../services/dashboardService';
import './Dashboard.css';

// ── Helpers ──
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)} L`;
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const getInitials = (firstName, lastName) => {
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || '?';
};

// ── Custom Tooltip for Bar Chart ──
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white', border: '1px solid #e0e0e0',
        borderRadius: '8px', padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <p style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#5B2D8E', fontWeight: 600 }}>
          Revenue: {formatCurrency(payload[0]?.value)}
        </p>
        {payload[1] && (
          <p style={{ color: '#2E7D32', fontWeight: 600 }}>
            Sales: {payload[1]?.value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ── Stat Card Component ──
const StatCard = ({ label, value, sub, icon, accent, loading, subClass }) => (
  <div className={`stat-card ${accent || ''}`}>
    <div className="stat-card-top">
      <span className="stat-label">{label}</span>
      <span className="stat-icon">{icon}</span>
    </div>
    <div className={`stat-value ${loading ? 'skeleton' : ''}`}>
      {loading ? '——' : value}
    </div>
    {sub && (
      <div className={`stat-sub ${subClass || ''} ${loading ? 'skeleton' : ''}`}>
        {loading ? '——' : sub}
      </div>
    )}
  </div>
);

// ── Main Component ──
const AdminDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const [stats, setStats]         = useState(null);
  const [performance, setPerformance] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentSales, setRecentSales]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'totalRevenue', dir: 'desc' });

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, perfRes, revenueRes, salesRes] = await Promise.all([
        getAdminStats(),
        getDealerPerformance(),
        getAdminMonthlyRevenue(),
        getAdminRecentSales(8),
      ]);
      setStats(statsRes.data.data);
      setPerformance(perfRes.data.data || []);
      setMonthlyRevenue(revenueRes.data.data || []);
      setRecentSales(salesRes.data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Sort performance table
  const sortedPerformance = [...performance].sort((a, b) => {
    const valA = a[sortConfig.key] ?? 0;
    const valB = b[sortConfig.key] ?? 0;
    return sortConfig.dir === 'asc' ? valA - valB : valB - valA;
  });

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
  };

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.dir === 'asc' ? '↑' : '↓';
  };

  // ── Render ──
  return (
    <AdminLayout>
      <div className="dashboard-page">

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {username}. Here is your nationwide network overview.</p>
          </div>
          <div className="dashboard-header-right">
            {lastUpdated && (
              <span className="last-updated">
                Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              className={`btn-refresh-dashboard ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchAll(true)}
              disabled={refreshing}
            >
              <span className="refresh-icon">↻</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {stats?.pendingStockRequests > 0 && (
          <div className="alert-banner warning">
            <span className="alert-banner-icon">⚠️</span>
            <span>
              You have <strong>{stats.pendingStockRequests}</strong> pending stock
              {stats.pendingStockRequests === 1 ? ' request' : ' requests'} awaiting approval.
            </span>
            <span
              className="alert-banner-link"
              onClick={() => navigate('/admin/stock-requests')}
            >
              Review Now →
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            sub={`${stats?.totalSales || 0} completed sales`}
            icon="₹"
            accent="accent-green"
            loading={loading}
            subClass="positive"
          />
          <StatCard
            label="Active Dealers"
            value={`${stats?.activeDealers || 0} / ${stats?.totalDealers || 0}`}
            sub={stats?.inactiveDealers > 0 ? `${stats.inactiveDealers} inactive` : 'All dealers active'}
            icon="◈"
            accent="accent-blue"
            loading={loading}
            subClass={stats?.inactiveDealers > 0 ? 'warning' : 'positive'}
          />
          <StatCard
            label="Total Customers"
            value={stats?.totalCustomers?.toLocaleString() || '0'}
            sub={`${stats?.totalLeads || 0} total leads`}
            icon="👤"
            loading={loading}
          />
          <StatCard
            label="Active Bookings"
            value={stats?.confirmedBookings || '0'}
            sub={`${stats?.totalBookings || 0} total bookings`}
            icon="✦"
            accent="accent-orange"
            loading={loading}
          />
          <StatCard
            label="Cars in Catalogue"
            value={stats?.totalCars || '0'}
            sub={`${stats?.totalVariants || 0} variants`}
            icon="◉"
            loading={loading}
          />
          <StatCard
            label="Pending Stock Requests"
            value={stats?.pendingStockRequests || '0'}
            sub="Awaiting approval"
            icon="↑"
            accent={stats?.pendingStockRequests > 0 ? 'accent-orange' : ''}
            loading={loading}
            subClass={stats?.pendingStockRequests > 0 ? 'warning' : ''}
          />
          <StatCard
            label="Total Employees"
            value={stats?.totalEmployees || '0'}
            sub="Across all dealerships"
            icon="👥"
            accent="accent-teal"
            loading={loading}
          />
          <StatCard
            label="Sales Converted"
            value={stats?.convertedBookings || '0'}
            sub={`of ${stats?.totalBookings || 0} bookings`}
            icon="✓"
            accent="accent-green"
            loading={loading}
            subClass="positive"
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">

          {/* Monthly Revenue Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3>Monthly Revenue</h3>
                <p>Last 6 months — all dealers combined</p>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner-sm" />
                Loading chart...
              </div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="chart-empty">No sales data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tick={{ fontSize: 12, fill: '#757575' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => {
                      if (v >= 10000000) return `₹${(v/10000000).toFixed(1)}Cr`;
                      if (v >= 100000)   return `₹${(v/100000).toFixed(0)}L`;
                      return `₹${v}`;
                    }}
                    tick={{ fontSize: 11, fill: '#757575' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(91,45,142,0.05)' }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {monthlyRevenue.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === monthlyRevenue.length - 1 ? '#5B2D8E' : '#C5A8E8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Sales Feed */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3>Recent Sales</h3>
                <p>Latest transactions</p>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner-sm" /> Loading...
              </div>
            ) : recentSales.length === 0 ? (
              <div className="empty-state-sm">No sales recorded yet.</div>
            ) : (
              <div className="recent-sales-list">
                {recentSales.map(sale => (
                  <div key={sale.id} className="recent-sale-item">
                    <div className="recent-sale-avatar">
                      {getInitials(sale.customer?.firstName, sale.customer?.lastName)}
                    </div>
                    <div className="recent-sale-info">
                      <div className="recent-sale-name">
                        {sale.customer?.firstName} {sale.customer?.lastName}
                      </div>
                      <div className="recent-sale-sub">
                        {sale.variant?.variantName} · {sale.dealer?.name}
                      </div>
                    </div>
                    <div>
                      <div className="recent-sale-amount">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      <div className="recent-sale-date">
                        {formatDate(sale.saleDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row — Dealer Performance Table */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <h3>Dealer Performance</h3>
              <p>Click column headers to sort</p>
            </div>
          </div>
          {loading ? (
            <div className="loading-state">
              <span className="loading-spinner-sm" /> Loading...
            </div>
          ) : performance.length === 0 ? (
            <div className="empty-state-sm">No dealer data available.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Dealer</th>
                    <th onClick={() => handleSort('totalRevenue')} style={{ cursor: 'pointer' }}>
                      Revenue <span className="sort-arrow">{sortArrow('totalRevenue')}</span>
                    </th>
                    <th onClick={() => handleSort('totalSales')} style={{ cursor: 'pointer' }}>
                      Sales <span className="sort-arrow">{sortArrow('totalSales')}</span>
                    </th>
                    <th onClick={() => handleSort('totalBookings')} style={{ cursor: 'pointer' }}>
                      Bookings <span className="sort-arrow">{sortArrow('totalBookings')}</span>
                    </th>
                    <th onClick={() => handleSort('totalLeads')} style={{ cursor: 'pointer' }}>
                      Leads <span className="sort-arrow">{sortArrow('totalLeads')}</span>
                    </th>
                    <th onClick={() => handleSort('availableInventory')} style={{ cursor: 'pointer' }}>
                      Inventory <span className="sort-arrow">{sortArrow('availableInventory')}</span>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPerformance.map((dealer, idx) => {
                    const rank = idx + 1;
                    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
                    return (
                      <tr key={dealer.dealerId}>
                        <td>
                          <span className={`rank-badge ${rankClass}`}>{rank}</span>
                        </td>
                        <td>
                          <div className="dealer-name-cell">
                            <span className="dealer-name-bold">{dealer.dealerName}</span>
                            <span className="dealer-city-sub">{dealer.city} · {dealer.dealerCode}</span>
                          </div>
                        </td>
                        <td className="revenue-cell">{formatCurrency(dealer.totalRevenue)}</td>
                        <td>{dealer.totalSales}</td>
                        <td>{dealer.totalBookings}</td>
                        <td>{dealer.totalLeads}</td>
                        <td>{dealer.availableInventory} units</td>
                        <td>
                          <span className={`status-dot ${dealer.status === 'ACTIVE' ? 'active' : 'inactive'}`} />
                          {dealer.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;