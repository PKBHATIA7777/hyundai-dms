import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  getAdminStats,
  getDealerPerformance,
  getAdminMonthlyRevenue,
  getAdminRecentSales,
} from '../../services/dashboardService';
import DataTable from '../../components/DataTable';
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
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const getInitials = (firstName, lastName) =>
  ((firstName?.charAt(0) || '') + (lastName?.charAt(0) || '')).toUpperCase() || '?';

const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#5B2D8E', fontWeight: 600 }}>Revenue: {formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

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

const AdminDashboard = () => {
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');

  const [stats, setStats]               = useState(null);
  const [performance, setPerformance]   = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentSales, setRecentSales]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);

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

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Dealer Performance DataTable columns ──
  // No row actions — this is a read-only analytics view.
  // Admins can navigate to dealer management from the sidebar.
  const performanceColumns = [
    {
      key: 'rank',
      header: '#',
      width: '50px',
      align: 'center',
      render: (_, row, index) => {
        // DataTable doesn't pass index natively, so derive rank from sorted data
        const rank = performance.indexOf(row) + 1;
        const colors = { 1: { bg: '#FFF8DC', color: '#B8860B' }, 2: { bg: '#F0F0F0', color: '#707070' }, 3: { bg: '#FFF0E6', color: '#CD7F32' } };
        const c = colors[rank] || { bg: 'var(--grey-light)', color: 'var(--grey-text)' };
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', fontSize: '11px', fontWeight: 700, background: c.bg, color: c.color }}>
            {rank}
          </span>
        );
      },
    },
    {
      key: 'dealerName',
      header: 'Dealer',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--grey-text)' }}>{row.city} · {row.dealerCode}</div>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Revenue',
      sortable: true,
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(val)}</span>,
    },
    {
      key: 'totalSales',
      header: 'Sales',
      sortable: true,
      align: 'center',
    },
    {
      key: 'totalBookings',
      header: 'Bookings',
      sortable: true,
      align: 'center',
    },
    {
      key: 'totalLeads',
      header: 'Leads',
      sortable: true,
      align: 'center',
    },
    {
      key: 'availableInventory',
      header: 'Inventory',
      sortable: true,
      align: 'center',
      render: (val) => `${val} units`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: val === 'ACTIVE' ? 'var(--success)' : 'var(--error)', flexShrink: 0 }} />
          {val}
        </span>
      ),
    },
  ];

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
            <span className="alert-banner-link" onClick={() => navigate('/admin/stock-requests')}>
              Review Now →
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue)} sub={`${stats?.totalSales || 0} completed sales`} icon="₹" accent="accent-green" loading={loading} subClass="positive" />
          <StatCard label="Active Dealers" value={`${stats?.activeDealers || 0} / ${stats?.totalDealers || 0}`} sub={stats?.inactiveDealers > 0 ? `${stats.inactiveDealers} inactive` : 'All dealers active'} icon="◈" accent="accent-blue" loading={loading} subClass={stats?.inactiveDealers > 0 ? 'warning' : 'positive'} />
          <StatCard label="Total Customers" value={stats?.totalCustomers?.toLocaleString() || '0'} sub={`${stats?.totalLeads || 0} total leads`} icon="👤" loading={loading} />
          <StatCard label="Active Bookings" value={stats?.confirmedBookings || '0'} sub={`${stats?.totalBookings || 0} total bookings`} icon="✦" accent="accent-orange" loading={loading} />
          <StatCard label="Cars in Catalogue" value={stats?.totalCars || '0'} sub={`${stats?.totalVariants || 0} variants`} icon="◉" loading={loading} />
          <StatCard label="Pending Stock Requests" value={stats?.pendingStockRequests || '0'} sub="Awaiting approval" icon="↑" accent={stats?.pendingStockRequests > 0 ? 'accent-orange' : ''} loading={loading} subClass={stats?.pendingStockRequests > 0 ? 'warning' : ''} />
          <StatCard label="Total Employees" value={stats?.totalEmployees || '0'} sub="Across all dealerships" icon="👥" accent="accent-teal" loading={loading} />
          <StatCard label="Sales Converted" value={stats?.convertedBookings || '0'} sub={`of ${stats?.totalBookings || 0} bookings`} icon="✓" accent="accent-green" loading={loading} subClass="positive" />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3>Monthly Revenue</h3>
                <p>Last 6 months — all dealers combined</p>
              </div>
            </div>
            {loading ? (
              <div className="loading-state"><span className="loading-spinner-sm" /> Loading chart...</div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="chart-empty">No sales data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 12, fill: '#757575' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => { if (v >= 10000000) return `₹${(v/10000000).toFixed(1)}Cr`; if (v >= 100000) return `₹${(v/100000).toFixed(0)}L`; return `₹${v}`; }} tick={{ fontSize: 11, fill: '#757575' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(91,45,142,0.05)' }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {monthlyRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === monthlyRevenue.length - 1 ? '#5B2D8E' : '#C5A8E8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Sales Feed */}
          <div className="section-card">
            <div className="section-card-header">
              <div><h3>Recent Sales</h3><p>Latest transactions</p></div>
            </div>
            {loading ? (
              <div className="loading-state"><span className="loading-spinner-sm" /> Loading...</div>
            ) : recentSales.length === 0 ? (
              <div className="empty-state-sm">No sales recorded yet.</div>
            ) : (
              <div className="recent-sales-list">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="recent-sale-item">
                    <div className="recent-sale-avatar">
                      {getInitials(sale.customer?.firstName, sale.customer?.lastName)}
                    </div>
                    <div className="recent-sale-info">
                      <div className="recent-sale-name">{sale.customer?.firstName} {sale.customer?.lastName}</div>
                      <div className="recent-sale-sub">{sale.variant?.variantName} · {sale.dealer?.name}</div>
                    </div>
                    <div>
                      <div className="recent-sale-amount">{formatCurrency(sale.totalAmount)}</div>
                      <div className="recent-sale-date">{formatDate(sale.saleDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dealer Performance — DataTable (read-only analytics, no row actions) */}
        <DataTable
          title="Dealer Performance"
          subtitle="Click column headers to sort · Read-only analytics view"
          columns={performanceColumns}
          data={performance}
          loading={loading}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No dealer performance data available."
          stickyHeader
        />

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;