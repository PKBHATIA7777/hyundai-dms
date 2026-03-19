import AdminLayout from '../../layouts/AdminLayout';
import './Dashboard.css';

const stats = [
  { label: 'Total Dealers', value: '--' },
  { label: 'Total Cars', value: '--' },
  { label: 'Total Variants', value: '--' },
  { label: 'Active Dealers', value: '--' },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin. Here is your system overview.</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;