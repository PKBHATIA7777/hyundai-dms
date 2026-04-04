import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import DataTable from '../../components/DataTable';

const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const ACTION_STYLES = {
  CREATE:     { background: '#E8F5E9', color: '#2E7D32' },
  CANCEL:     { background: '#FEE2E2', color: '#C62828' },
  DEACTIVATE: { background: '#FEE2E2', color: '#C62828' },
  REJECT:     { background: '#FEE2E2', color: '#C62828' },
  ACTIVATE:   { background: '#E3F2FD', color: '#1565C0' },
  APPROVE:    { background: '#E3F2FD', color: '#1565C0' },
  RESET:      { background: '#FFF8E1', color: '#E65100' },
};

const getActionStyle = (action) => {
  if (!action) return { background: '#F5F5F5', color: '#757575' };
  for (const key of Object.keys(ACTION_STYLES)) {
    if (action.includes(key)) return ACTION_STYLES[key];
  }
  return { background: '#F5F5F5', color: '#757575' };
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/audit-logs');
      const data = res.data?.data ?? res.data;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Derive unique action types for filter
  const actionOptions = [...new Set(logs.map((l) => l.action).filter(Boolean))]
    .sort()
    .map((a) => ({ label: a, value: a }));

  // ── Columns ──
  // No row actions — audit logs are immutable system records.
  // Allowing edit/delete of audit logs would defeat their purpose.
  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      width: '190px',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--grey-text)', whiteSpace: 'nowrap' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (val) => {
        const style = getActionStyle(val);
        return (
          <span style={{ ...style, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      sortable: true,
      render: (val) =>
        val?.username ? (
          <span style={{ fontWeight: 600 }}>{val.username}</span>
        ) : (
          <span style={{ color: 'var(--grey-text)', fontStyle: 'italic' }}>System</span>
        ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (val) => (
        <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>{val || '--'}</span>
      ),
    },
  ];

  // ── Filters ──
  const filters = actionOptions.length > 0
    ? [
        {
          key: 'action',
          label: 'Action Type',
          type: 'select',
          options: actionOptions,
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
              Audit Logs
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
              Complete history of all system actions and changes.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            style={{
              background: 'transparent', border: '1.5px solid var(--purple-border)',
              color: 'var(--purple-main)', padding: '8px 16px',
              borderRadius: 'var(--radius-sm)', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* DataTable — no row actions (audit logs must never be modified) */}
        <DataTable
          title="Log Entries"
          subtitle="Sorted newest first"
          columns={columns}
          data={logs}
          loading={loading}
          filters={filters}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
          emptyMessage="No audit log entries found."
          stickyHeader
        />

      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;