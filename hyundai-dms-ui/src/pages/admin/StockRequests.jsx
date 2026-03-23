import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllStockRequests,
  approveStockRequest,
  rejectStockRequest,
  getAllInvoices
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
              <h3>All Requests ({requests.length})</h3>
              <button className="btn-refresh" onClick={fetchRequests}>
                Refresh
              </button>
            </div>

            {requestsLoading ? (
              <div className="loading-state">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="empty-state">No stock requests found.</div>
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
                  {requests.map(req => (
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
                        {req.status === 'PENDING' ? (
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
                        ) : (
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