import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import './DealerManagement.css';

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdDealerInfo, setCreatedDealerInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '', city: '', contactNumber: '', address: '', email: ''
  });

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await api.get('/admin/dealers');
      setDealers(res.data);
    } catch {
      setError('Failed to load dealers.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleCreateDealer = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/admin/dealers', form);
      setCreatedDealerInfo(res.data);
      setShowModal(false);
      setShowPasswordModal(true);
      setForm({ name: '', city: '', contactNumber: '', address: '', email: '' });
      fetchDealers();
    } catch (err) {
      setFormError(err.response?.data || 'Failed to create dealer.');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.put(`/admin/dealers/${id}/deactivate`);
      fetchDealers();
    } catch {
      setError('Failed to deactivate dealer.');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/dealers/${id}/activate`);
      fetchDealers();
    } catch {
      setError('Failed to activate dealer.');
    }
  };

  const handleResetPassword = async (id) => {
    try {
      const res = await api.put(`/admin/dealers/${id}/reset-password`);
      setCreatedDealerInfo({
        generatedPassword: res.data.newPassword,
        username: dealers.find(d => d.id === id)?.dealerCode,
        message: 'Password reset successfully.'
      });
      setShowPasswordModal(true);
    } catch {
      setError('Failed to reset password.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdDealerInfo?.generatedPassword || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="dealer-mgmt-page">
        <div className="page-header">
          <div>
            <h1>Dealer Management</h1>
            <p>Manage all your dealerships across the network.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add Dealer
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading dealers...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dealer Code</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">No dealers found. Add your first dealer.</td>
                  </tr>
                ) : (
                  dealers.map(dealer => (
                    <tr key={dealer.id}>
                      <td><code className="code-badge">{dealer.dealerCode}</code></td>
                      <td className="dealer-name">{dealer.name}</td>
                      <td>{dealer.city}</td>
                      <td>{dealer.contactNumber}</td>
                      <td>
                        <span className={`status-badge ${dealer.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                          {dealer.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {dealer.status === 'ACTIVE' ? (
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeactivate(dealer.id)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn-sm btn-success"
                            onClick={() => handleActivate(dealer.id)}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => handleResetPassword(dealer.id)}
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Dealer Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Dealer</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateDealer} className="modal-form">
                <div className="form-group">
                  <label>Dealer Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} required placeholder="e.g. Hyundai Chennai" />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input name="city" value={form.city} onChange={handleFormChange} required placeholder="e.g. Chennai" />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} required placeholder="e.g. 9876543210" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleFormChange} required placeholder="e.g. dealer@hyundai.com" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleFormChange} placeholder="Optional" />
                </div>
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Dealer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && createdDealerInfo && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Dealer Account Created</h3>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>
              <div className="password-info">
                <p className="password-note">{createdDealerInfo.message}</p>
                <div className="info-row">
                  <span className="info-label">Username</span>
                  <span className="info-value">{createdDealerInfo.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Password</span>
                  <div className="password-display">
                    <code className="password-code">{createdDealerInfo.generatedPassword}</code>
                    <button className="copy-btn" onClick={handleCopy}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p className="password-warning">
                  Please save this password now. It will not be shown again.
                </p>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setShowPasswordModal(false)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DealerManagement;