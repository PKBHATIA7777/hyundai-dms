import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getMyInventory } from '../../services/inventoryService';
import DataTable from '../../components/DataTable';

const DealerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => { fetchInventory(); }, []);

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

  // ── Columns ──
  // No row actions — dealer cannot directly modify inventory.
  // Stock is added by admin; dealer can only request via "Request Stock" page.
  const columns = [
    {
      key: 'car',
      header: 'Car',
      sortable: true,
      render: (_, row) => (
        <span style={{ fontWeight: 600 }}>{row.variant?.car?.modelName || '—'}</span>
      ),
    },
    {
      key: 'variant',
      header: 'Variant',
      sortable: true,
      render: (_, row) => row.variant?.variantName || '—',
    },
    {
      key: 'colour',
      header: 'Colour',
      sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%',
            border: '1px solid var(--grey-mid)', flexShrink: 0,
            background: row.colour?.colourCode?.startsWith('#') ? row.colour.colourCode : '#ccc',
          }} />
          {row.colour?.colourName}
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Total Stock',
      sortable: true,
      align: 'center',
    },
    {
      key: 'reservedQuantity',
      header: 'Reserved',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span style={{ color: val > 0 ? 'var(--warning)' : 'var(--grey-text)' }}>{val}</span>
      ),
    },
    {
      key: 'available',
      header: 'Available',
      sortable: true,
      align: 'center',
      render: (_, row) => {
        const available = row.stockQuantity - row.reservedQuantity;
        let bg = '#DCFCE7', color = '#166534';
        if (available === 0) { bg = '#FEE2E2'; color = '#991B1B'; }
        else if (available <= 2) { bg = '#FEF3C7'; color = '#92400E'; }
        return (
          <span style={{ background: bg, color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {available}
          </span>
        );
      },
    },
  ];

  // ── Filters ──
  const filters = [
    {
      key: 'stockLevel',
      label: 'Stock Level',
      type: 'select',
      options: [
        { label: 'Available (>0)', value: 'available' },
        { label: 'Low Stock (≤2)', value: 'low' },
        { label: 'Out of Stock', value: 'out' },
      ],
    },
  ];

  // Custom filter logic — we need to pre-process the data for the stock level filter
  // DataTable filters match exact keys; we enrich data with a computed field
  const enrichedInventory = inventory.map((item) => ({
    ...item,
    stockLevel: (() => {
      const avail = item.stockQuantity - item.reservedQuantity;
      if (avail === 0) return 'out';
      if (avail <= 2)  return 'low';
      return 'available';
    })(),
  }));

  return (
    <DealerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
              My Inventory
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
              View all stock levels for your dealership.
            </p>
          </div>
          <button
            onClick={fetchInventory}
            style={{ background: 'transparent', border: '1.5px solid var(--purple-border)', color: 'var(--purple-main)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* DataTable — no row actions (read-only inventory view) */}
        <DataTable
          title="All Stock Items"
          subtitle={`${inventory.length} stock lines across all variants`}
          columns={columns}
          data={enrichedInventory}
          loading={loading}
          filters={filters}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No stock found for your dealership. Contact admin to add inventory."
          stickyHeader
        />

      </div>
    </DealerLayout>
  );
};

export default DealerInventory;