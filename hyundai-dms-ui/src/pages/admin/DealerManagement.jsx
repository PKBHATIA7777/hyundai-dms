import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import { toast } from '../../components/Toast';

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdDealerInfo, setCreatedDealerInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  // ✅ NEW: search + filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    name: '', city: '', contactNumber: '', address: '', email: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await api.get('/admin/dealers');
      setDealers(res.data);
    } catch {
      toast.error('Failed to load dealers.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: filtering logic
  const filtered = dealers
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.dealerCode.toLowerCase().includes(search.toLowerCase()) ||
      (d.city || '').toLowerCase().includes(search.toLowerCase())
    )
    .filter(d =>
      statusFilter ? d.status === statusFilter : true
    );

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  // ✅ FIXED: always send status ACTIVE
  const handleCreateDealer = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/admin/dealers', {
        ...form,
        status: 'ACTIVE'
      });
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
      toast.success('Dealer deactivated successfully.');
      fetchDealers();
    } catch {
      toast.error('Failed to deactivate dealer.');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/dealers/${id}/activate`);
      toast.success('Dealer activated successfully.');
      fetchDealers();
    } catch {
      toast.error('Failed to activate dealer.');
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
      toast.error('Failed to reset password.');
    }
  };

  const handleAddStock = (dealer) => {
    navigate(`/admin/inventory?dealerId=${dealer.id}&dealerName=${encodeURIComponent(dealer.name)}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdDealerInfo?.generatedPassword || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="card">
        <div className="page-header">
          <div>
            <h1>Dealer Management</h1>
            <p>Manage all your dealerships across the network.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add Dealer
          </button>
        </div>

        {/* ✅ NEW: Search + Filter Bar */}
        <div className="filter-bar">
          <input
            className="search-input"
            placeholder="Search by name, code or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading dealers...</div>
        ) : (
          <table className="std-table">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No dealers found.
                  </td>
                </tr>
              ) : (
                filtered.map(dealer => (
                  <tr key={dealer.id}>
                    <td><code>{dealer.dealerCode}</code></td>
                    <td>{dealer.name}</td>
                    <td>{dealer.city}</td>
                    <td>{dealer.contactNumber}</td>
                    <td>
                      <span className={dealer.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}>
                        {dealer.status}
                      </span>
                    </td>
                    <td>
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
                      <button
                        className="btn-sm btn-primary"
                        onClick={() => handleAddStock(dealer)}
                      >
                        Add Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                  <input name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input name="city" value={form.city} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleFormChange} />
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
                <h3>Dealer Account Info</h3>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>✕</button>
              </div>
              <div className="password-info">
                <p>{createdDealerInfo.message}</p>
                <p><strong>Username:</strong> {createdDealerInfo.username}</p>
                <p>
                  <strong>Password:</strong>{' '}
                  <code>{createdDealerInfo.generatedPassword}</code>
                  <button onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
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