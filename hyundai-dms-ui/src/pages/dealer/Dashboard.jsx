import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../../layouts/DealerLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  getDealerStats,
  getDealerMonthlyRevenue,
  getDealerRecentSales,
} from '../../services/dashboardService';
import { getMyInventory } from '../../services/inventoryService';
import { getMyLeads } from '../../services/leadService';
import './DealerDashboard.css';

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
    day: '2-digit', month: 'short'
  });
};

const getInitials = (firstName, lastName) => {
  return ((firstName?.charAt(0) || '') + (lastName?.charAt(0) || '')).toUpperCase() || '?';
};

// ── Tooltip ──
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white', border: '1px solid #e0e0e0',
        borderRadius: '8px', padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <p style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#1E4D7B', fontWeight: 600 }}>
          Revenue: {formatCurrency(payload[0]?.value)}
        </p>
      </div>
    );
  }
  return null;
};

// ── Stat Card ──
const StatCard = ({ label, value, sub, icon, accent, loading, subClass }) => (
  <div className={`dealer-stat-card ${accent || ''}`}>
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

// ── Pipeline Stages ──
const PIPELINE_STAGES = [
  { key: 'NEW',        label: 'New',        fillClass: 'fill-new'        },
  { key: 'CONTACTED',  label: 'Contacted',  fillClass: 'fill-contacted'  },
  { key: 'INTERESTED', label: 'Interested', fillClass: 'fill-interested' },
  { key: 'BOOKED',     label: 'Booked',     fillClass: 'fill-booked'     },
  { key: 'LOST',       label: 'Lost',       fillClass: 'fill-lost'       },
];

// ── Main Component ──
const DealerDashboard = () => {
  const navigate  = useNavigate();
  const username  = localStorage.getItem('username');
  const dealerStatus = localStorage.getItem('dealerStatus');

  const [stats, setStats]               = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentSales, setRecentSales]   = useState([]);
  const [inventory, setInventory]       = useState([]);
  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, revenueRes, salesRes, inventoryRes, leadsRes] = await Promise.all([
        getDealerStats(),
        getDealerMonthlyRevenue(),
        getDealerRecentSales(5),
        getMyInventory(),
        getMyLeads(),
      ]);
      setStats(statsRes.data.data);
      setMonthlyRevenue(revenueRes.data.data || []);
      setRecentSales(salesRes.data.data || []);
      setInventory(inventoryRes.data.data || inventoryRes.data || []);
      setLeads(leadsRes.data.data || leadsRes.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dealer dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Lead pipeline counts
  const leadCounts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = leads.filter(l => l.status === stage.key).length;
    return acc;
  }, {});
  const maxLeadCount = Math.max(...Object.values(leadCounts), 1);

  // Inventory badge
  const getStockBadge = (available) => {
    if (available === 0) return 'stock-badge stock-zero';
    if (available <= 2)  return 'stock-badge stock-low';
    return 'stock-badge stock-good';
  };

  return (
    <DealerLayout>
      <div className="dealer-dashboard-page">

        {/* Deactivation Banner */}
        {dealerStatus === 'INACTIVE' && (
          <div className="deactivation-banner">
            ⚠️ Your dealer account has been deactivated by Admin. Please contact headquarters.
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1>Dealer Dashboard</h1>
            <p>Welcome, {username}. Here is your dealership overview.</p>
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

        {/* Stats Grid */}
        <div className="dealer-stats-grid">
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(stats?.todayRevenue)}
            sub={`${stats?.todaySales || 0} sales today`}
            icon="₹"
            accent="accent-green"
            loading={loading}
            subClass="positive"
          />
          <StatCard
            label="Month Revenue"
            value={formatCurrency(stats?.monthRevenue)}
            sub={`${stats?.monthSales || 0} sales this month`}
            icon="📅"
            loading={loading}
            subClass="positive"
          />
          <StatCard
            label="Active Bookings"
            value={stats?.activeBookings || '0'}
            sub="Confirmed, awaiting sale"
            icon="✦"
            accent="accent-orange"
            loading={loading}
          />
          <StatCard
            label="Open Leads"
            value={stats?.openLeads || '0'}
            sub="In pipeline"
            icon="◎"
            accent="accent-purple"
            loading={loading}
          />
          <StatCard
            label="Available Stock"
            value={stats?.availableInventoryUnits || '0'}
            sub={`of ${stats?.totalInventoryUnits || 0} total units`}
            icon="▦"
            accent="accent-teal"
            loading={loading}
          />
          <StatCard
            label="Pending Requests"
            value={stats?.pendingStockRequests || '0'}
            sub="Stock requests pending"
            icon="↑"
            accent={stats?.pendingStockRequests > 0 ? 'accent-orange' : ''}
            loading={loading}
            subClass={stats?.pendingStockRequests > 0 ? 'warning' : ''}
          />
          <StatCard
            label="Active Employees"
            value={`${stats?.activeEmployees || 0} / ${stats?.totalEmployees || 0}`}
            sub="Staff members"
            icon="👥"
            loading={loading}
          />
          <StatCard
            label="Total Leads"
            value={leads.length}
            sub={`${leadCounts['BOOKED'] || 0} converted to booking`}
            icon="📋"
            loading={loading}
            subClass="positive"
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-bar">
          <button className="quick-action-btn" onClick={() => navigate('/dealer/leads')}>
            <span className="quick-action-icon">◎</span>
            <div className="quick-action-text">
              <span className="quick-action-label">New Lead</span>
              <span className="quick-action-sub">Add customer to pipeline</span>
            </div>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/dealer/bookings')}>
            <span className="quick-action-icon">✦</span>
            <div className="quick-action-text">
              <span className="quick-action-label">New Booking</span>
              <span className="quick-action-sub">Reserve a vehicle</span>
            </div>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/dealer/sales')}>
            <span className="quick-action-icon">₹</span>
            <div className="quick-action-text">
              <span className="quick-action-label">Complete Sale</span>
              <span className="quick-action-sub">Convert booking to sale</span>
            </div>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/dealer/stock-requests')}>
            <span className="quick-action-icon">↑</span>
            <div className="quick-action-text">
              <span className="quick-action-label">Request Stock</span>
              <span className="quick-action-sub">Order from headquarters</span>
            </div>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/dealer/employees')}>
            <span className="quick-action-icon">👥</span>
            <div className="quick-action-text">
              <span className="quick-action-label">Employees</span>
              <span className="quick-action-sub">Manage your team</span>
            </div>
          </button>
        </div>

        {/* Middle Row — Chart + Lead Pipeline */}
        <div className="middle-row">

          {/* Monthly Revenue Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3>Monthly Revenue</h3>
                <p>Last 6 months performance</p>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner-sm" /> Loading chart...
              </div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="chart-empty">No sales data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
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
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(30,77,123,0.05)' }} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {monthlyRevenue.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === monthlyRevenue.length - 1 ? '#1E4D7B' : '#90B4D4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lead Pipeline */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3>Lead Pipeline</h3>
                <p>{leads.length} total leads</p>
              </div>
              <button className="btn-view-all" onClick={() => navigate('/dealer/leads')}>
                View All →
              </button>
            </div>
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner-sm" /> Loading...
              </div>
            ) : leads.length === 0 ? (
              <div className="empty-state-sm">No leads yet.</div>
            ) : (
              <div className="pipeline-list">
                {PIPELINE_STAGES.map(stage => {
                  const count = leadCounts[stage.key] || 0;
                  const pct   = maxLeadCount > 0 ? (count / maxLeadCount) * 100 : 0;
                  return (
                    <div key={stage.key} className="pipeline-item">
                      <span className="pipeline-status-label">{stage.label}</span>
                      <div className="pipeline-bar-track">
                        <div
                          className={`pipeline-bar-fill ${stage.fillClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="pipeline-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row — Recent Sales + Inventory */}
        <div className="bottom-row">

          {/* Recent Sales */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3>Recent Sales</h3>
                <p>Latest completed transactions</p>
              </div>
              <button className="btn-view-all" onClick={() => navigate('/dealer/sales')}>
                View All →
              </button>
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
                        {sale.variant?.variantName} · {sale.colour?.colourName}
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

          {/* Inventory Summary */}
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h3>Inventory Summary</h3>
                <p>{inventory.length} stock lines</p>
              </div>
              <button className="btn-view-all" onClick={() => navigate('/dealer/inventory')}>
                View All →
              </button>
            </div>
            {loading ? (
              <div className="loading-state">
                <span className="loading-spinner-sm" /> Loading...
              </div>
            ) : inventory.length === 0 ? (
              <div className="empty-state-sm">No inventory found.</div>
            ) : (
              <div className="inventory-summary-list">
                {inventory.slice(0, 6).map(item => {
                  const available = item.stockQuantity - item.reservedQuantity;
                  return (
                    <div key={item.id} className="inventory-item">
                      <div
                        className="colour-swatch"
                        style={{
                          background: item.colour?.colourCode?.startsWith('#')
                            ? item.colour.colourCode : '#ccc'
                        }}
                      />
                      <div className="inventory-item-info">
                        <div className="inventory-item-name">
                          {item.variant?.variantName}
                        </div>
                        <div className="inventory-item-colour">
                          {item.colour?.colourName}
                        </div>
                      </div>
                      <span className={getStockBadge(available)}>
                        {available} avail.
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </DealerLayout>
  );
};

export default DealerDashboard;