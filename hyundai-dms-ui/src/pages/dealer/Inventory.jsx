import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getMyInventory } from '../../services/inventoryService';
import './Inventory.css';

const DealerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ NEW: search + filter + sort
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('asc');

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

  // ✅ Stock badge
  const getStockBadge = (available) => {
    if (available === 0) return 'stock-badge stock-zero';
    if (available <= 2) return 'stock-badge stock-low';
    return 'stock-badge stock-good';
  };

  // ✅ Filter logic
  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      item.variant?.car?.modelName?.toLowerCase().includes(q) ||
      item.variant?.variantName?.toLowerCase().includes(q) ||
      item.colour?.colourName?.toLowerCase().includes(q);

    const available = item.stockQuantity - item.reservedQuantity;

    const matchStock =
      !stockFilter ||
      (stockFilter === 'low' && available > 0 && available <= 2) ||
      (stockFilter === 'out' && available === 0) ||
      (stockFilter === 'available' && available > 0);

    return matchSearch && matchStock;
  });

  // ✅ Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortArrow = (field) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const sorted = [...filtered].sort((a, b) => {
    const getValue = (item) => {
      switch (sortField) {
        case 'car':
          return item.variant?.car?.modelName || '';
        case 'variant':
          return item.variant?.variantName || '';
        case 'colour':
          return item.colour?.colourName || '';
        case 'stock':
          return item.stockQuantity;
        case 'reserved':
          return item.reservedQuantity;
        case 'available':
          return item.stockQuantity - item.reservedQuantity;
        default:
          return '';
      }
    };

    const valA = getValue(a);
    const valB = getValue(b);

    if (typeof valA === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    } else {
      return sortDir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
  });

  return (
    <DealerLayout>
      <div className="dealer-inventory-page">

        <div className="page-header">
          <h1>My Inventory</h1>
          <p>View all stock levels for your dealership.</p>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h3>All Stock Items ({filtered.length})</h3>
            <button className="btn-refresh" onClick={fetchInventory}>
              Refresh
            </button>
          </div>

          {/* ✅ NEW: Filter Bar */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by car, variant, colour..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Stock</option>
              <option value="available">Available</option>
              <option value="low">Low Stock (≤2)</option>
              <option value="out">Out of Stock</option>
            </select>
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
                  <th onClick={() => handleSort('car')}>
                    Car {sortArrow('car')}
                  </th>
                  <th onClick={() => handleSort('variant')}>
                    Variant {sortArrow('variant')}
                  </th>
                  <th onClick={() => handleSort('colour')}>
                    Colour {sortArrow('colour')}
                  </th>
                  <th onClick={() => handleSort('stock')}>
                    Total Stock {sortArrow('stock')}
                  </th>
                  <th onClick={() => handleSort('reserved')}>
                    Reserved {sortArrow('reserved')}
                  </th>
                  <th onClick={() => handleSort('available')}>
                    Available {sortArrow('available')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => {
                  const available = item.stockQuantity - item.reservedQuantity;

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>
                        {item.variant?.car?.modelName || '—'}
                      </td>
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
                        <span className={getStockBadge(available)}>
                          {available}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DealerLayout>
  );
};

export default DealerInventory;