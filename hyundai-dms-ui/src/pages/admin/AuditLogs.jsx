import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
};

const getActionStyle = (action) => {
    if (action?.includes('CREATE')) return { background: '#E8F5E9', color: '#2E7D32' };
    if (action?.includes('CANCEL') || action?.includes('DEACTIVATE') || action?.includes('REJECT'))
        return { background: '#FFEBEE', color: '#C62828' };
    if (action?.includes('ACTIVATE') || action?.includes('APPROVE'))
        return { background: '#E3F2FD', color: '#1565C0' };
    return { background: '#F5F5F5', color: '#757575' };
};

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ✅ NEW FILTER STATES
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

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

    // ✅ DERIVE UNIQUE ACTION TYPES
    const actionTypes = [...new Set(logs.map(l => l.action).filter(Boolean))].sort();

    // ✅ FILTER LOGIC
    const filtered = logs.filter(log => {
        const matchAction = !actionFilter || log.action === actionFilter;
        const matchUser =
            !userFilter ||
            log.performedBy?.username?.toLowerCase().includes(userFilter.toLowerCase());

        return matchAction && matchUser;
    });

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                        Audit Logs
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
                        Complete history of all system actions and changes.
                    </p>
                </div>

                {/* ✅ FILTER BAR */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                        className="search-input"
                        placeholder="Filter by user..."
                        value={userFilter}
                        onChange={e => setUserFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            border: '1.5px solid var(--grey-mid)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            width: '260px',
                            outline: 'none'
                        }}
                    />

                    <select
                        className="filter-select"
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        style={{
                            padding: '10px 14px',
                            border: '1.5px solid var(--grey-mid)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Action Types</option>
                        {actionTypes.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    <button
                        className="btn-ghost"
                        onClick={() => {
                            setActionFilter('');
                            setUserFilter('');
                        }}
                        style={{
                            background: 'transparent',
                            border: '1.5px solid var(--grey-mid)',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#FFEBEE',
                        border: '1px solid #FFCDD2',
                        color: 'var(--error)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--grey-mid)'
                    }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'var(--text-dark)'
                        }}>
                            Log Entries ({filtered.length})
                        </h3>

                        <button onClick={fetchLogs} style={{
                            background: 'transparent',
                            border: '1.5px solid var(--purple-border)',
                            color: 'var(--purple-main)',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '40px' }}>
                            Loading audit logs...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '40px' }}>
                            No logs match the current filters.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Timestamp', 'Action', 'Performed By', 'Details'].map(h => (
                                            <th key={h} style={{
                                                background: 'var(--purple-soft)',
                                                color: 'var(--purple-dark)',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '13px 16px',
                                                textAlign: 'left'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(log => {
                                        const actionStyle = getActionStyle(log.action);
                                        return (
                                            <tr key={log.id} style={{ borderBottom: '1px solid var(--grey-mid)' }}>
                                                <td style={{
                                                    padding: '13px 16px',
                                                    fontSize: '12px',
                                                    color: 'var(--grey-text)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {formatDate(log.timestamp)}
                                                </td>

                                                <td style={{ padding: '13px 16px' }}>
                                                    <span style={{
                                                        ...actionStyle,
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {log.action}
                                                    </span>
                                                </td>

                                                <td style={{
                                                    padding: '13px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: 600
                                                }}>
                                                    {log.performedBy?.username || (
                                                        <span style={{ color: 'var(--grey-text)', fontStyle: 'italic' }}>
                                                            System
                                                        </span>
                                                    )}
                                                </td>

                                                <td style={{
                                                    padding: '13px 16px',
                                                    fontSize: '13px',
                                                    color: 'var(--text-mid)'
                                                }}>
                                                    {log.details}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAuditLogs;