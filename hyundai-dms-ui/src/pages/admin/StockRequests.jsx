import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllStockRequests,
  approveStockRequest,
  rejectStockRequest,
  getAllInvoices,
  dispatchStockRequest // ⚠️ Add this export to stockRequestService
} from '../../services/stockRequestService';
import './StockRequests.css';

const AdminStockRequests = () => {
  const [activeTab, setActiveTab] = useState('requests');

  // Requests
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Invoices
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setActionError('');
    try {
      const res = await getAllStockRequests();
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      setActionError(
        err.response?.data || 'Failed to refresh requests. Please try again.'
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setInvoicesLoading(true);
    setActionError('');
    try {
      const res = await getAllInvoices();
      if (Array.isArray(res.data)) {
        setInvoices(res.data);
      }
    } catch (err) {
      setActionError(
        err.response?.data || 'Failed to refresh invoices. Please try again.'
      );
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionError('');
    setActionLoading(id);
    try {
      await approveStockRequest(id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionError('');
    setActionLoading(id);
    try {
      await rejectStockRequest(id);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Failed to reject request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispatch = async (id) => {
    setActionLoading(id);
    try {
      // ⚠️ Ensure dispatchStockRequest is added to stockRequestService
      // or replace with direct api.put call if using axios instance
      const res = await dispatchStockRequest(id);
      const invoice = res.data;
      printAdminInvoice(invoice);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data || 'Dispatch failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewInvoice = async (reqId) => {
    try {
      // Fetch invoice associated with this request
      const res = await getAllInvoices();
      const invoice = res.data?.find(inv => inv.stockRequest?.id === reqId);
      if (invoice) {
        printAdminInvoice(invoice);
      } else {
        setActionError('Invoice not found for this request.');
      }
    } catch (err) {
      setActionError('Failed to fetch invoice.');
    }
  };

  const printAdminInvoice = (invoice) => {
    const req = invoice.stockRequest;
    const html = `<!DOCTYPE html><html><head><title>Supply Invoice ${invoice.invoiceNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 48px; color: #111; }
      h1 { color: #4A2C8F; } .label { font-size: 11px; text-transform: uppercase; color: #6B7280; }
      .val { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
      .footer { margin-top: 48px; border-top: 1px solid #e4e4e7; padding-top: 16px; font-size: 12px; color: #6B7280; }
      @media print { body { padding: 24px; } }
    </style></head><body>
    <h1>Hyundai DMS — Supply Invoice</h1>
    <p style="color:#6B7280">Issued by: Hyundai Headquarters</p>
    <div class="grid">
      <div><div class="label">Invoice Number</div><div class="val">${invoice.invoiceNumber}</div></div>
      <div><div class="label">Invoice Date</div><div class="val">${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div></div>
      <div><div class="label">Dealer</div><div class="val">${invoice.dealer?.name} (${invoice.dealer?.dealerCode})</div></div>
      <div><div class="label">Status</div><div class="val">DISPATCHED</div></div>
      <div><div class="label">Variant</div><div class="val">${req?.variant?.variantName}</div></div>
      <div><div class="label">Colour</div><div class="val">${req?.colour?.colourName} — ${req?.colour?.colourCode}</div></div>
      <div><div class="label">Quantity Dispatched</div><div class="val">${req?.requestedQuantity} units</div></div>
    </div>
    <div class="footer">This is a system-generated document. Hyundai Dealer Management System.</div>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'status-badge status-pending';
    if (status === 'APPROVED') return 'status-badge status-approved';
    if (status === 'REJECTED') return 'status-badge status-rejected';
    if (status === 'DISPATCHED') return 'status-badge status-dispatched';
    return 'status-badge';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // Filter logic
  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.dealer?.name?.toLowerCase().includes(q) ||
      r.variant?.variantName?.toLowerCase().includes(q) ||
      r.colour?.colourName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <AdminLayout>
      <div className="stock-requests-page">

        {/* Header */}
        <div className="page-header">
          <h1>Stock Requests</h1>
          <p>Review dealer stock requests and manage supply invoices.</p>
        </div>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        {/* Tabs */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests {pendingCount > 0 && `(${pendingCount} pending)`}
          </button>
          <button
            className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Supply Invoices
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="table-wrapper">
            <div className="table-header">
              <h3>All Requests ({filteredRequests.length})</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search dealer, variant, colour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '280px' }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DISPATCHED">Dispatched</option>
                </select>
                <button className="btn-refresh" onClick={fetchRequests}>
                  Refresh
                </button>
              </div>
            </div>

            {requestsLoading ? (
              <div className="loading-state">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="empty-state">
                {requests.length === 0 ? 'No stock requests found.' : 'No results match your filters.'}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dealer</th>
                    <th>Car</th>
                    <th>Variant</th>
                    <th>Colour</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>{req.dealer?.name}</td>
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
                        {req.status === 'PENDING' && (
                          <div className="actions-cell">
                            <button
                              className="btn-sm btn-approve"
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              {actionLoading === req.id ? '...' : 'Approve'}
                            </button>
                            <button
                              className="btn-sm btn-reject"
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading === req.id}
                            >
                              {actionLoading === req.id ? '...' : 'Reject'}
                            </button>
                          </div>
                        )}
                        {req.status === 'APPROVED' && (
                          <button
                            className="btn-sm btn-dispatch"
                            onClick={() => handleDispatch(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? '...' : 'Dispatch'}
                          </button>
                        )}
                        {req.status === 'DISPATCHED' && (
                          <button
                            className="btn-sm btn-invoice"
                            onClick={() => handleViewInvoice(req.id)}
                          >
                            View Invoice
                          </button>
                        )}
                        {req.status === 'REJECTED' && (
                          <span style={{ fontSize: '12px', color: 'var(--grey-text)' }}>
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="table-wrapper">
            <div className="table-header">
              <h3>All Supply Invoices ({invoices.length})</h3>
              <button className="btn-refresh" onClick={fetchInvoices}>
                Refresh
              </button>
            </div>

            {invoicesLoading ? (
              <div className="loading-state">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="empty-state">No invoices generated yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Dealer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td>
                        <span className="invoice-number">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td>{inv.dealer?.name}</td>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      <td>
                        <span className="status-badge status-approved">
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-invoice"
                          onClick={() => printAdminInvoice(inv)}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminStockRequests;