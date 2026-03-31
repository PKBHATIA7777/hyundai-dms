import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import { toast } from '../../components/Toast';
import DataTable from '../../components/DataTable';

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdDealerInfo, setCreatedDealerInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');
  const [openActionId, setOpenActionId] = useState(null);
  
  const [form, setForm] = useState({
    name: '', city: '', contactNumber: '', address: '', email: ''
  });
  
  const navigate = useNavigate();
  const actionMenuRef = useRef(null);
  
  useEffect(() => {
    fetchDealers();
  }, []);
  
  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dealers');
      setDealers(res.data);
    } catch (err) {
      console.error('Fetch dealers error:', err);
      toast.error('Failed to load dealers.');
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
      const res = await api.post('/admin/dealers', { ...form, status: 'ACTIVE' });
      setCreatedDealerInfo(res.data);
      setShowModal(false);
      setShowPasswordModal(true);
      setForm({ name: '', city: '', contactNumber: '', address: '', email: '' });
      fetchDealers();
    } catch (err) {
      console.error('Create dealer error:', err);
      setFormError(err.response?.data || 'Failed to create dealer.');
    }
  };
  
  const handleDeactivate = async (id) => {
    try {
      await api.put(`/admin/dealers/${id}/deactivate`);
      toast.success('Dealer deactivated successfully.');
      setOpenActionId(null);
      fetchDealers();
    } catch (err) {
      console.error('Deactivate error:', err);
      toast.error('Failed to deactivate dealer.');
    }
  };
  
  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/dealers/${id}/activate`);
      toast.success('Dealer activated successfully.');
      setOpenActionId(null);
      fetchDealers();
    } catch (err) {
      console.error('Activate error:', err);
      toast.error('Failed to activate dealer.');
    }
  };
  
  const handleResetPassword = async (row) => {
    try {
      console.log('Resetting password for dealer:', row.id);
      const res = await api.put(`/admin/dealers/${row.id}/reset-password`);
      console.log('Password reset response:', res.data);
      setCreatedDealerInfo({
        generatedPassword: res.data.newPassword,
        username: row.dealerCode,
        message: 'Password reset successfully.'
      });
      setShowPasswordModal(true);
      setOpenActionId(null);
      toast.success('Password reset successfully.');
    } catch (err) {
      console.error('Reset password error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(createdDealerInfo?.generatedPassword || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleActionMenu = (id) => {
    setOpenActionId(openActionId === id ? null : id);
  };
  
  // ── DataTable column definitions ──
  const columns = [
    {
      key: 'dealerCode',
      header: 'Dealer Code',
      sortable: true,
      width: '140px',
      render: (val) => (
        <code style={{
          background: 'var(--purple-soft)', color: 'var(--purple-dark)',
          padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace'
        }}>
          {val}
        </code>
      ),
    },
    {
      key: 'name',
      header: 'Dealer Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'city',
      header: 'City',
      sortable: true,
    },
    {
      key: 'contactNumber',
      header: 'Contact',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: val === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
          color: val === 'ACTIVE' ? '#166534' : '#991B1B',
        }}>
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '140px',
      render: (_, row) => (
        <div 
          style={{ position: 'relative', display: 'inline-block' }}
          ref={openActionId === row.id ? actionMenuRef : null}
        >
          <button
            onClick={() => toggleActionMenu(row.id)}
            style={{
              padding: '6px 12px',
              background: 'var(--purple-soft)',
              color: 'var(--purple-dark)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            Actions <span style={{ fontSize: '10px' }}>▼</span>
          </button>
          
          {openActionId === row.id && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 4px)',
                background: 'var(--white)',
                border: '1px solid var(--grey-mid)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '180px',
                overflow: 'hidden'
              }}
            >
              {row.status === 'ACTIVE' && (
                <button
                  onClick={() => handleDeactivate(row.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--grey-mid)',
                    fontSize: '13px',
                    color: '#991B1B',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>🚫</span> Deactivate
                </button>
              )}
              {row.status === 'INACTIVE' && (
                <button
                  onClick={() => handleActivate(row.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--grey-mid)',
                    fontSize: '13px',
                    color: '#166534',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>✅</span> Activate
                </button>
              )}
              <button
                onClick={() => handleResetPassword(row)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--grey-mid)',
                  fontSize: '13px',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>🔑</span> Reset Password
              </button>
              <button
                onClick={() => {
                  navigate(`/admin/inventory?dealerId=${row.id}&dealerName=${encodeURIComponent(row.name)}`);
                  setOpenActionId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>📦</span> Add Stock
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];
  
  // ── DataTable filter definitions ──
  // Extract unique cities for filter options
  const cityOptions = [
    ...new Set(dealers.map(d => d.city).filter(Boolean))
  ].map(city => ({ label: city, value: city }));
  
  // Only Status and City filters (removed text filters)
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
    },
    {
      key: 'city',
      label: 'City',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        ...cityOptions,
      ],
    },
  ];
  
  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
              Dealer Management
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
              Manage all your dealerships across the network.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add Dealer
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          title="All Dealers"
          subtitle={`${dealers.length} registered dealerships`}
          columns={columns}
          data={dealers}
          loading={loading}
          filters={filters}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No dealers found. Click '+ Add Dealer' to get started."
        />

        {/* Create Dealer Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: '20px',
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--grey-mid)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Dealer</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--grey-text)' }}>✕</button>
              </div>
              <form onSubmit={handleCreateDealer} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'name', label: 'Dealer Name *', type: 'text' },
                  { name: 'city', label: 'City *', type: 'text' },
                  { name: 'contactNumber', label: 'Contact Number *', type: 'text' },
                  { name: 'email', label: 'Email *', type: 'email' },
                  { name: 'address', label: 'Address', type: 'text' },
                ].map(({ name, label, type }) => (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-mid)' }}>{label}</label>
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleFormChange}
                      required={name !== 'address'}
                      style={{ padding: '10px 14px', border: '1.5px solid var(--grey-mid)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--grey-light)' }}
                    />
                  </div>
                ))}
                {formError && (
                  <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                    {formError}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Dealer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && createdDealerInfo && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200, padding: '20px',
            }}
            onClick={() => setShowPasswordModal(false)}
          >
            <div
              style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--grey-mid)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Dealer Account Info</h3>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--grey-text)' }}>✕</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>{createdDealerInfo.message}</p>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grey-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Username</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{createdDealerInfo.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grey-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Generated Password</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <code style={{ background: 'var(--purple-soft)', color: 'var(--purple-dark)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: '22px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '4px' }}>
                      {createdDealerInfo.generatedPassword}
                    </code>
                    <button
                      onClick={handleCopy}
                      style={{ padding: '8px 14px', background: 'var(--purple-main)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--warning)', background: '#FFF8E1', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #FFE082' }}>
                  ⚠️ Share this password securely. It will not be shown again.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--grey-mid)' }}>
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