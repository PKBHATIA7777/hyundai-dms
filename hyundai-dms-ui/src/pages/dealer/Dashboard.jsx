import DealerLayout from '../../layouts/DealerLayout';
import './DealerDashboard.css';

const stats = [
  { label: "Today's Sales", value: '--' },
  { label: 'Active Bookings', value: '--' },
  { label: 'Open Leads', value: '--' },
  { label: 'Stock Available', value: '--' },
];

const DealerDashboard = () => {
  const dealerStatus = localStorage.getItem('dealerStatus');
  const username = localStorage.getItem('username');

  return (
    <DealerLayout>
      <div className="dealer-dashboard-page">

        {dealerStatus === 'INACTIVE' && (
          <div className="deactivation-banner">
            Your dealer account has been deactivated by the Admin.
            Please contact headquarters for assistance.
          </div>
        )}

        <div className="dashboard-header">
          <h1>Dealer Dashboard</h1>
          <p>Welcome, {username}. Here is your dealership overview.</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card dealer-stat-card" key={index}>
              <p className="stat-label">{stat.label}</p>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          ))}
        </div>
      </div>
    </DealerLayout>
  );
};

export default DealerDashboard;