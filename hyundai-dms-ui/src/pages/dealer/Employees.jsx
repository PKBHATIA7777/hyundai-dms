import { useState, useEffect, useCallback } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import {
  getMyEmployees,
  createMyEmployee,
  updateMyEmployee,
  deactivateMyEmployee,
  activateMyEmployee,
} from '../../services/employeeService';
import DataTable from '../../components/DataTable';

const EMPTY_FORM = { firstName: '', lastName: '', phone: '', email: '', designation: '' };

const DESIGNATIONS = [
  'Sales Executive', 'Senior Sales Executive', 'Sales Manager',
  'Finance Manager', 'Service Advisor', 'Team Lead', 'Other',
];

const getInitials = (f, l) =>
  ((f?.charAt(0) || '') + (l?.charAt(0) || '')).toUpperCase() || '?';

const DealerEmployees = () => {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const [showAddModal, setShowAddModal]   = useState(false);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [formError, setFormError]         = useState('');
  const [formSuccess, setFormSuccess]     = useState('');
  const [formLoading, setFormLoading]     = useState(false);

  const [editEmployee, setEditEmployee]   = useState(null);
  const [editForm, setEditForm]           = useState(EMPTY_FORM);
  const [editError, setEditError]         = useState('');
  const [editLoading, setEditLoading]     = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyEmployees();
      const data = res.data?.data ?? res.data;
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setFormLoading(true);
    try {
      await createMyEmployee({ ...form, email: form.email || null, designation: form.designation || null });
      setFormSuccess('Employee added successfully.');
      setForm(EMPTY_FORM);
      setShowAddModal(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data || 'Failed to add employee.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (row) => {
    setActionLoading(row.id);
    try {
      if (row.status === 'ACTIVE') await deactivateMyEmployee(row.id);
      else await activateMyEmployee(row.id);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (row) => {
    setEditEmployee(row);
    setEditForm({ firstName: row.firstName, lastName: row.lastName, phone: row.phone || '', email: row.email || '', designation: row.designation || '' });
    setEditError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditError('');
    try {
      await updateMyEmployee(editEmployee.id, { ...editForm, email: editForm.email || null, designation: editForm.designation || null, status: editEmployee.status });
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      setEditError(err.response?.data?.error || err.response?.data || 'Failed to update employee.');
    } finally {
      setEditLoading(false);
    }
  };

  const activeCount   = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE').length;

  // ── Columns ──
  const columns = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1E4D7B, #2E6DA4)',
            color: 'white', fontSize: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {getInitials(row.firstName, row.lastName)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.firstName} {row.lastName}</div>
            <div style={{ fontSize: '11px', color: 'var(--grey-text)' }}>{row.designation || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (val) => val || '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (val) => val || '—',
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      render: (val) => val || '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'center',
      render: (val) => (
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: val === 'ACTIVE' ? '#E8F5E9' : '#FEE2E2',
          color: val === 'ACTIVE' ? '#166534' : '#991B1B',
        }}>
          {val}
        </span>
      ),
    },
  ];

  // ── Filters ──
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
    },
  ];

  // ── Row actions ──
  // Edit: always available — employees need to be updated
  // Deactivate/Activate: toggle based on current status
  // NO Delete — backend has no delete endpoint; soft-delete (deactivate) is the pattern
  const rowActions = [
    {
      label: 'Edit',
      icon: '✏',
      variant: 'primary',
      onClick: openEdit,
    },
    {
      label: 'Deactivate',
      icon: '🚫',
      variant: 'danger',
      hidden: (row) => row.status !== 'ACTIVE',
      disabled: (row) => actionLoading === row.id,
      onClick: handleToggleStatus,
    },
    {
      label: 'Activate',
      icon: '✅',
      variant: 'success',
      hidden: (row) => row.status !== 'INACTIVE',
      disabled: (row) => actionLoading === row.id,
      onClick: handleToggleStatus,
    },
  ];

  const inputStyle = { padding: '10px 14px', border: '1.5px solid var(--grey-mid)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--grey-light)', width: '100%' };
  const labelStyle = { fontSize: '13px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '6px', display: 'block' };

  const EmployeeFormFields = ({ values, onChange }) => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><label style={labelStyle}>First Name *</label><input name="firstName" value={values.firstName} onChange={onChange} placeholder="Ravi" required style={inputStyle} /></div>
        <div><label style={labelStyle}>Last Name *</label><input name="lastName" value={values.lastName} onChange={onChange} placeholder="Kumar" required style={inputStyle} /></div>
      </div>
      <div><label style={labelStyle}>Phone *</label><input name="phone" value={values.phone} onChange={onChange} placeholder="9876543210" required style={inputStyle} /></div>
      <div><label style={labelStyle}>Email</label><input name="email" type="email" value={values.email} onChange={onChange} placeholder="ravi@dealer.com" style={inputStyle} /></div>
      <div>
        <label style={labelStyle}>Designation</label>
        <select name="designation" value={values.designation} onChange={onChange} style={inputStyle}>
          <option value="">-- Select designation --</option>
          {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <DealerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>Employees</h1>
            <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>Manage your dealership team members.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Employee</button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Employees', value: employees.length, accent: '#1E4D7B' },
            { label: 'Active', value: activeCount, accent: 'var(--success)' },
            { label: 'Inactive', value: inactiveCount, accent: 'var(--error)' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '16px 22px', boxShadow: 'var(--shadow-sm)', borderLeft: `3px solid ${s.accent}`, minWidth: '150px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grey-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: s.accent, marginTop: '4px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* DataTable */}
        <DataTable
          title="My Team"
          subtitle={`${employees.length} employees`}
          columns={columns}
          data={employees}
          loading={loading}
          filters={filters}
          rowActions={rowActions}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No employees added yet. Click '+ Add Employee' to get started."
        />

        {/* Add Employee Modal */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)' }} onMouseDown={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--grey-mid)' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Add New Employee</h3>
                <button onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); setFormError(''); }} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--grey-text)' }}>✕</button>
              </div>
              <form onSubmit={handleCreate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <EmployeeFormFields values={form} onChange={(e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setFormError(''); }} />
                {formError && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>{formError}</div>}
                {formSuccess && <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>{formSuccess}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                  <button type="button" className="btn-ghost" onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); setFormError(''); }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Adding...' : '+ Add Employee'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {editEmployee && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }} onMouseDown={(e) => { if (e.target === e.currentTarget) setEditEmployee(null); }}>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-lg)' }} onMouseDown={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--grey-mid)' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Edit Employee</h3>
                <button onClick={() => setEditEmployee(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--grey-text)' }}>✕</button>
              </div>
              <form onSubmit={handleEditSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <EmployeeFormFields values={editForm} onChange={(e) => { setEditForm((p) => ({ ...p, [e.target.name]: e.target.value })); setEditError(''); }} />
                {editError && <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>{editError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                  <button type="button" className="btn-ghost" onClick={() => setEditEmployee(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DealerLayout>
  );
};

export default DealerEmployees;