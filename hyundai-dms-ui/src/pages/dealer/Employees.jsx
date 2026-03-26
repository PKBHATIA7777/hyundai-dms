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

  // Add form
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Edit modal
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm]         = useState(EMPTY_FORM);
  const [editError, setEditError]       = useState('');
  const [editLoading, setEditLoading]   = useState(false);

  // Action loading per row
  const [actionLoading, setActionLoading] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyEmployees();
      const data = res.data.data || res.data;
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

  // ── Add Employee ──
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

  // ── Toggle Status ──
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

  // ── Edit Modal ──
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

  // ── Counts ──
  const activeCount   = employees.filter(e => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter(e => e.status === 'INACTIVE').length;

  const getInitials = (f, l) =>
    ((f?.charAt(0) || '') + (l?.charAt(0) || '')).toUpperCase() || '?';

  return (
    <DealerLayout>
      <div className="employees-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Employees</h1>
            <p>Manage your dealership team members.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-pill-label">Total Employees</span>
            <span className="stat-pill-value">{employees.length}</span>
          </div>
          <div className="stat-pill" style={{ borderLeftColor: 'var(--success)' }}>
            <span className="stat-pill-label">Active</span>
            <span className="stat-pill-value" style={{ color: 'var(--success)' }}>
              {activeCount}
            </span>
          </div>
          <div className="stat-pill" style={{ borderLeftColor: 'var(--error)' }}>
            <span className="stat-pill-label">Inactive</span>
            <span className="stat-pill-value" style={{ color: 'var(--error)' }}>
              {inactiveCount}
            </span>
          </div>
        </div>

        <div className="employees-layout">

          {/* Add Employee Form */}
          <div className="section-card">
            <h3 className="section-title">Add New Employee</h3>
            <form onSubmit={handleCreate} className="inline-form">

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
                <select name="designation" value={form.designation} onChange={handleFormChange}>
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

              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? 'Adding...' : '+ Add Employee'}
              </button>

            </form>
          </div>

          {/* Employees Table */}
          <div className="table-wrapper">
            <div className="table-header">
              <h3>My Team ({employees.length})</h3>
              <button className="btn-refresh" onClick={fetchEmployees}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading-state">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="empty-state">
                No employees added yet. Add your first team member.
              </div>
            ) : (
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
                  {employees.map(emp => (
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
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editEmployee && (
          <div className="modal-overlay" onClick={() => setEditEmployee(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
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
                  <button
                    type="button"
                    className="btn-secondary-outline"
                    onClick={() => setEditEmployee(null)}
                  >
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