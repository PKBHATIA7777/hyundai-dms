import { useState, useEffect, useCallback } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import {
  getMyEmployees,
  createMyEmployee,
  updateMyEmployee,
  deactivateMyEmployee,
  activateMyEmployee,
} from '../../services/employeeService';
import './Employees.css';

const EMPTY_FORM = {
  firstName: '', lastName: '', phone: '',
  email: '', designation: '',
};

const DealerEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm]         = useState(EMPTY_FORM);
  const [editError, setEditError]       = useState('');
  const [editLoading, setEditLoading]   = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.designation?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
    setFormSuccess('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);
    try {
      await createMyEmployee({
        firstName:   form.firstName,
        lastName:    form.lastName,
        phone:       form.phone,
        email:       form.email || null,
        designation: form.designation || null,
      });
      setFormSuccess('Employee added successfully.');
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      fetchEmployees();
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to add employee.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const closeAddModal = () => {
    setShowAddForm(false);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
  };

  const handleToggleStatus = async (employee) => {
    setActionLoading(employee.id);
    try {
      if (employee.status === 'ACTIVE') {
        await deactivateMyEmployee(employee.id);
      } else {
        await activateMyEmployee(employee.id);
      }
      fetchEmployees();
    } catch (err) {
      alert(
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to update status.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (employee) => {
    setEditEmployee(employee);
    setEditForm({
      firstName:   employee.firstName,
      lastName:    employee.lastName,
      phone:       employee.phone || '',
      email:       employee.email || '',
      designation: employee.designation || '',
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setEditError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await updateMyEmployee(editEmployee.id, {
        firstName:   editForm.firstName,
        lastName:    editForm.lastName,
        phone:       editForm.phone,
        email:       editForm.email || null,
        designation: editForm.designation || null,
        status:      editEmployee.status,
      });
      setEditEmployee(null);
      fetchEmployees();
    } catch (err) {
      setEditError(
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to update employee.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const activeCount   = employees.filter(e => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter(e => e.status === 'INACTIVE').length;

  const getInitials = (f, l) =>
    ((f?.charAt(0) || '') + (l?.charAt(0) || '')).toUpperCase() || '?';

  return (
    <DealerLayout>
      <div className="employees-page">

        <div className="page-header">
          <div>
            <h1>Employees</h1>
            <p>Manage your dealership team members.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            + Add Employee
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-pill-label">Total Employees</span>
            <span className="stat-pill-value">{employees.length}</span>
          </div>
          <div className="stat-pill" style={{ borderLeftColor: 'var(--success)' }}>
            <span className="stat-pill-label">Active</span>
            <span className="stat-pill-value" style={{ color: 'var(--success)' }}>{activeCount}</span>
          </div>
          <div className="stat-pill" style={{ borderLeftColor: 'var(--error)' }}>
            <span className="stat-pill-label">Inactive</span>
            <span className="stat-pill-value" style={{ color: 'var(--error)' }}>{inactiveCount}</span>
          </div>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <h3>My Team ({filtered.length})</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by name, phone, designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <button className="btn-refresh" onClick={fetchEmployees}>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading employees...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {employees.length === 0
                ? 'No employees added yet. Click "+ Add Employee" to get started.'
                : 'No employees match your search criteria.'}
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div>
                            <div className="employee-name">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="employee-designation">
                              {emp.designation || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.phone || '—'}</td>
                      <td>{emp.email || '—'}</td>
                      <td>{emp.designation || '—'}</td>
                      <td>
                        <span className={`status-badge status-${emp.status?.toLowerCase()}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => openEdit(emp)}
                          >
                            Edit
                          </button>
                          {emp.status === 'ACTIVE' ? (
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => handleToggleStatus(emp)}
                              disabled={actionLoading === emp.id}
                            >
                              {actionLoading === emp.id ? '...' : 'Deactivate'}
                            </button>
                          ) : (
                            <button
                              className="btn-sm btn-success"
                              onClick={() => handleToggleStatus(emp)}
                              disabled={actionLoading === emp.id}
                            >
                              {actionLoading === emp.id ? '...' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Employee Modal */}
        {showAddForm && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}
          >
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Employee</h3>
                <button className="modal-close" onClick={closeAddModal}>✕</button>
              </div>
              <form onSubmit={handleCreate} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleFormChange}
                      placeholder="Ravi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleFormChange}
                      placeholder="Kumar"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="9876543210"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="ravi@dealer.com"
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    name="designation"
                    value={form.designation}
                    onChange={handleFormChange}
                  >
                    <option value="">-- Select designation --</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Senior Sales Executive">Senior Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Service Advisor">Service Advisor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formError   && <div className="alert alert-error">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-outline" onClick={closeAddModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={formLoading}>
                    {formLoading ? 'Adding...' : '+ Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editEmployee && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setEditEmployee(null); }}
          >
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Employee</h3>
                <button className="modal-close" onClick={() => setEditEmployee(null)}>✕</button>
              </div>
              <form onSubmit={handleEditSave} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    name="designation"
                    value={editForm.designation}
                    onChange={handleEditChange}
                  >
                    <option value="">-- Select designation --</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Senior Sales Executive">Senior Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Finance Manager">Finance Manager</option>
                    <option value="Service Advisor">Service Advisor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {editError && <div className="alert alert-error">{editError}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-outline" onClick={() => setEditEmployee(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
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