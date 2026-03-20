import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getMyInventory } from '../../services/inventoryService';
import './Inventory.css';

const DealerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getMyInventory();
      setInventory(res.data);
    } catch {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (available) => {
    if (available === 0) return 'stock-badge stock-zero';
    if (available <= 2) return 'stock-badge stock-low';
    return 'stock-badge stock-good';
  };

  return (
    <DealerLayout>
      <div className="dealer-inventory-page">

        <div className="page-header">
          <h1>My Inventory</h1>
          <p>View all stock levels for your dealership.</p>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h3>All Stock Items ({inventory.length})</h3>
            <button className="btn-refresh" onClick={fetchInventory}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading inventory...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : inventory.length === 0 ? (
            <div className="empty-state">No stock found for your dealership.</div>
          ) : (
            <table className="data-table">
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
                {inventory.map(item => (
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
          )}
        </div>

      </div>
    </DealerLayout>
  );
};

export default DealerInventory;