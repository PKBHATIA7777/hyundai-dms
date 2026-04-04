import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { addStock, getInventoryByDealerId } from '../../services/inventoryService';
import { getAllCars } from '../../services/carService';
import api from '../../services/api';
import DataTable from '../../components/DataTable';

const AdminInventoryManagement = () => {
  const [searchParams] = useSearchParams();
  const urlDealerId   = searchParams.get('dealerId');
  const urlDealerName = searchParams.get('dealerName');

  const [dealers, setDealers]                   = useState([]);
  const [selectedDealerId, setSelectedDealerId]   = useState(urlDealerId || '');
  const [selectedDealerName, setSelectedDealerName] = useState(urlDealerName ? decodeURIComponent(urlDealerName) : '');

  const [cars, setCars]                           = useState([]);
  const [selectedCarId, setSelectedCarId]         = useState('');
  const [variants, setVariants]                   = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [colours, setColours]                     = useState([]);
  const [selectedColourId, setSelectedColourId]   = useState('');
  const [quantity, setQuantity]                   = useState('');

  const [inventory, setInventory]             = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchDealers(); fetchCars(); }, []);

  useEffect(() => {
    if (selectedDealerId) fetchInventory(selectedDealerId);
    else setInventory([]);
  }, [selectedDealerId]);

  useEffect(() => {
    if (selectedCarId) {
      const car = cars.find((c) => c.id === Number(selectedCarId));
      setVariants(car?.variants || []);
      setSelectedVariantId('');
      setColours([]);
      setSelectedColourId('');
    } else {
      setVariants([]); setSelectedVariantId('');
      setColours([]);  setSelectedColourId('');
    }
  }, [selectedCarId, cars]);

  useEffect(() => {
    if (selectedVariantId) {
      const v = variants.find((v) => v.id === Number(selectedVariantId));
      setColours(v?.availableColours || []);
      setSelectedColourId('');
    } else {
      setColours([]); setSelectedColourId('');
    }
  }, [selectedVariantId, variants]);

  const fetchDealers = async () => {
    try { const res = await api.get('/admin/dealers'); setDealers(res.data); }
    catch { setFormError('Failed to load dealers.'); }
  };

  const fetchCars = async () => {
    try { const res = await getAllCars(); setCars(res.data); }
    catch { setFormError('Failed to load cars.'); }
  };

  const fetchInventory = async (dealerId) => {
    setInventoryLoading(true);
    try {
      const res = await getInventoryByDealerId(dealerId);
      setInventory(res.data);
    } catch { setInventory([]); }
    finally { setInventoryLoading(false); }
  };

  const handleDealerChange = (e) => {
    const id = e.target.value;
    const dealer = dealers.find((d) => d.id === Number(id));
    setSelectedDealerId(id);
    setSelectedDealerName(dealer?.name || '');
    setFormError(''); setFormSuccess('');
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setFormLoading(true);
    try {
      await addStock({
        dealerId:  Number(selectedDealerId),
        variantId: Number(selectedVariantId),
        colourId:  Number(selectedColourId),
        quantity:  Number(quantity),
      });
      setFormSuccess(`Successfully added ${quantity} unit(s) to ${selectedDealerName}.`);
      setSelectedCarId(''); setSelectedVariantId('');
      setSelectedColourId(''); setQuantity('');
      fetchInventory(selectedDealerId);
    } catch (err) {
      setFormError(err.response?.data || 'Failed to add stock.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Inventory DataTable columns ──
  // No row actions — inventory rows are not directly editable.
  // Stock is added via the form above. There is no backend endpoint
  // to edit or delete individual inventory rows directly.
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

  const formFieldStyle = {
    padding: '10px 14px', border: '1.5px solid var(--grey-mid)',
    borderRadius: 'var(--radius-sm)', fontSize: '14px',
    color: 'var(--text-dark)', background: 'var(--grey-light)', width: '100%',
  };
  const labelStyle = { fontSize: '13px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '6px', display: 'block' };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
            Inventory Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
            Add stock to dealers and monitor inventory levels.
          </p>
        </div>

        {/* Top Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>

          {/* Add Stock Form */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--grey-mid)' }}>
              Add Stock to Dealer
            </h3>
            <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={labelStyle}>Select Dealer *</label>
                <select value={selectedDealerId} onChange={handleDealerChange} required style={formFieldStyle}>
                  <option value="">-- Select a dealer --</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.dealerCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Select Car *</label>
                <select value={selectedCarId} onChange={(e) => setSelectedCarId(e.target.value)} disabled={!selectedDealerId} required style={{ ...formFieldStyle, opacity: !selectedDealerId ? 0.6 : 1 }}>
                  <option value="">-- Select a car --</option>
                  {cars.map((c) => <option key={c.id} value={c.id}>{c.modelName}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Select Variant *</label>
                <select value={selectedVariantId} onChange={(e) => setSelectedVariantId(e.target.value)} disabled={!selectedCarId} required style={{ ...formFieldStyle, opacity: !selectedCarId ? 0.6 : 1 }}>
                  <option value="">-- Select a variant --</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.variantName} — ₹{Number(v.price).toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Select Colour *</label>
                <select value={selectedColourId} onChange={(e) => setSelectedColourId(e.target.value)} disabled={!selectedVariantId} required style={{ ...formFieldStyle, opacity: !selectedVariantId ? 0.6 : 1 }}>
                  <option value="">-- Select a colour --</option>
                  {colours.map((c) => (
                    <option key={c.id} value={c.id}>{c.colourName} ({c.colourCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 5" min="1" required style={formFieldStyle} />
              </div>

              {formError && (
                <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: '10px 20px', background: 'linear-gradient(135deg, var(--purple-main), var(--purple-light))',
                  color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '14px', fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer',
                  opacity: formLoading ? 0.6 : 1, alignSelf: 'flex-start',
                }}
              >
                {formLoading ? 'Adding...' : '+ Add Stock'}
              </button>
            </form>
          </div>

          {/* Selected Dealer Info */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--grey-mid)' }}>
              Selected Dealer
            </h3>
            {selectedDealerName ? (
              <div style={{ background: 'var(--purple-soft)', border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--purple-dark)' }}>{selectedDealerName}</div>
                <div style={{ fontSize: '12px', color: 'var(--purple-main)', marginTop: '4px' }}>
                  {inventory.length} inventory line{inventory.length !== 1 ? 's' : ''} currently
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '30px', fontSize: '14px' }}>
                No dealer selected yet.
              </div>
            )}
          </div>
        </div>

        {/* Inventory DataTable */}
        {selectedDealerId && (
          <DataTable
            title={`Inventory — ${selectedDealerName}`}
            subtitle="Current stock levels for this dealer"
            columns={columns}
            data={inventory}
            loading={inventoryLoading}
            defaultPageSize={25}
            pageSizeOptions={[10, 25, 50]}
            emptyMessage="No stock found for this dealer."
            stickyHeader
          />
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminInventoryManagement;