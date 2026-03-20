import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../../layouts/DealerLayout';
import { getMyInventory } from '../../services/inventoryService';
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
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await getMyInventory();
      setInventory(res.data);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const getStockBadge = (available) => {
    if (available === 0) return 'stock-badge stock-zero';
    if (available <= 2) return 'stock-badge stock-low';
    return 'stock-badge stock-good';
  };

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

        {/* Inventory Summary */}
        <div className="dashboard-inventory-section">
          <div className="dashboard-inventory-header">
            <h2>Inventory Summary</h2>
            <button
              className="btn-view-all"
              onClick={() => navigate('/dealer/inventory')}
            >
              View All →
            </button>
          </div>

          {inventoryLoading ? (
            <div className="loading-state">Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="empty-state">No inventory found.</div>
          ) : (
            <div className="dashboard-inventory-table-wrapper">
              <table className="dashboard-inventory-table">
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>Colour</th>
                    <th>Total Stock</th>
                    <th>Reserved</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td>{item.variant?.variantName}</td>
                      <td>
                        <div className="colour-cell">
                          <div
                            className="colour-swatch"
                            style={{
                              background: item.colour?.colourCode?.startsWith('#')
                                ? item.colour.colourCode
                                : '#ccc'
                            }}
                          />
                          {item.colour?.colourName}
                        </div>
                      </td>
                      <td>{item.stockQuantity}</td>
                      <td>{item.reservedQuantity}</td>
                      <td>
                        <span className={getStockBadge(item.stockQuantity - item.reservedQuantity)}>
                          {item.stockQuantity - item.reservedQuantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inventory.length > 5 && (
                <div className="inventory-more">
                  +{inventory.length - 5} more items —
                  <button
                    className="btn-link"
                    onClick={() => navigate('/dealer/inventory')}
                  >
                    View All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </DealerLayout>
  );
};

export default DealerDashboard;