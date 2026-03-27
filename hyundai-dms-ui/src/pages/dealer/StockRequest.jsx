import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { createStockRequest, getMyStockRequests } from '../../services/stockRequestService';
import { getAllCars } from '../../services/carService';
import './StockRequest.css';

const DealerStockRequest = () => {
  // Cars cascade
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [colours, setColours] = useState([]);
  const [selectedColourId, setSelectedColourId] = useState('');

  // Form
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Requests table
  const [requests, setRequests] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    fetchCars();
    fetchMyRequests();
  }, []);

  useEffect(() => {
    if (selectedCarId) {
      const car = cars.find(c => c.id === Number(selectedCarId));
      setVariants(car?.variants || []);
      setSelectedVariantId('');
      setColours([]);
      setSelectedColourId('');
    } else {
      setVariants([]);
      setSelectedVariantId('');
      setColours([]);
      setSelectedColourId('');
    }
  }, [selectedCarId]);

  useEffect(() => {
    if (selectedVariantId) {
      const variant = variants.find(v => v.id === Number(selectedVariantId));
      setColours(variant?.availableColours || []);
      setSelectedColourId('');
    } else {
      setColours([]);
      setSelectedColourId('');
    }
  }, [selectedVariantId]);

  const fetchCars = async () => {
    try {
      const res = await getAllCars();
      setCars(res.data);
    } catch {
      setFormError('Failed to load cars.');
    }
  };

  const fetchMyRequests = async () => {
    setTableLoading(true);
    try {
      const res = await getMyStockRequests();
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      setFormError(
        err.response?.data || 'Failed to refresh requests. Please try again.'
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      await createStockRequest({
        variantId: Number(selectedVariantId),
        colourId: Number(selectedColourId),
        requestedQuantity: Number(quantity),
        notes: notes
      });

      setFormSuccess('Stock request submitted successfully.');
      setSelectedCarId('');
      setSelectedVariantId('');
      setSelectedColourId('');
      setQuantity('');
      setNotes('');
      fetchMyRequests();

    } catch (err) {
      setFormError(err.response?.data || 'Failed to submit request.');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'status-badge status-pending';
    if (status === 'APPROVED') return 'status-badge status-approved';
    if (status === 'REJECTED') return 'status-badge status-rejected';
    return 'status-badge';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <DealerLayout>
      <div className="stock-request-page">

        <div className="page-header">
          <h1>Request Stock</h1>
          <p>Submit stock requests to headquarters and track their status.</p>
        </div>

        <div className="stock-request-layout">

          {/* Request Form */}
          <div className="section-card">
            <h3 className="section-title">New Stock Request</h3>
            <form onSubmit={handleSubmit} className="inline-form">

              <div className="form-group">
                <label>Select Car *</label>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  required
                >
                  <option value="">-- Select a car --</option>
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>{c.modelName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Variant *</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  disabled={!selectedCarId}
                  required
                >
                  <option value="">-- Select a variant --</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.variantName} — ₹{Number(v.price).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Colour *</label>
                <select
                  value={selectedColourId}
                  onChange={(e) => setSelectedColourId(e.target.value)}
                  disabled={!selectedVariantId}
                  required
                >
                  <option value="">-- Select a colour --</option>
                  {colours.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.colourName} ({c.colourCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional — e.g. Urgent requirement"
                />
              </div>

              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

              <button
                type="submit"
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Submitting...' : 'Submit Request'}
              </button>

            </form>
          </div>

          {/* My Requests Table */}
          <div className="table-wrapper">
            <div className="table-header">
              <h3>My Requests ({requests.length})</h3>
              <button className="btn-refresh" onClick={fetchMyRequests}>
                Refresh
              </button>
            </div>

            {tableLoading ? (
              <div className="loading-state">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="empty-state">No requests submitted yet.</div>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>Variant</th>
                      <th>Colour</th>
                      <th>Qty</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td>{req.variant?.car?.modelName || '--'}</td>
                        <td>{req.variant?.variantName}</td>
                        <td>{req.colour?.colourName}</td>
                        <td>{req.requestedQuantity}</td>
                        <td>{formatDate(req.requestDate)}</td>
                        <td>
                          <span className={getStatusClass(req.status)}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <span className="notes-text">
                            {req.notes || '--'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </DealerLayout>
  );
};

export default DealerStockRequest;