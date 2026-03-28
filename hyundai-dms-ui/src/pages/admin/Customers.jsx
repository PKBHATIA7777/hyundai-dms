import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import './Customers.css';

const AdminCustomers = () => {
    const [byDealerData, setByDealerData] = useState([]);
    const [expandedDealers, setExpandedDealers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchByDealer = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/customers/by-dealer');
            setByDealerData(res.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to load dealer grouped customers.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchByDealer();
    }, [fetchByDealer]);

    const toggleDealer = (dealerId) => {
        setExpandedDealers(prev =>
            prev.includes(dealerId)
                ? prev.filter(id => id !== dealerId)
                : [...prev, dealerId]
        );
    };

    const totalCustomers = byDealerData.reduce((sum, d) => sum + (d.customerCount || 0), 0);

    const filteredData = byDealerData.filter(entry =>
        !search || entry.dealer?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="customers-page">

                <div className="page-header">
                    <div>
                        <h1>Customers</h1>
                        <p>All customers grouped by their dealership.</p>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-pill">
                        <span className="stat-pill-label">Total Customers</span>
                        <span className="stat-pill-value">{totalCustomers}</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-label">Total Dealers</span>
                        <span className="stat-pill-value">{byDealerData.length}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by dealer name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '300px' }}
                    />
                    <button
                        className="btn-refresh"
                        onClick={fetchByDealer}
                        style={{
                            background: 'transparent',
                            border: '1.5px solid var(--purple-border)',
                            color: 'var(--purple-main)',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <div className="dealer-accordion">
                    {loading ? (
                        <div className="loading-state">Loading customer data...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-state">
                            {search ? `No dealers match "${search}".` : 'No dealer data available.'}
                        </div>
                    ) : (
                        filteredData.map(entry => (
                            <div key={entry.dealer.id} className="dealer-accordion-item">
                                <div
                                    className="dealer-accordion-header"
                                    onClick={() => toggleDealer(entry.dealer.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="dealer-accordion-name">
                                        {entry.dealer.name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--grey-text)', marginLeft: '8px' }}>
                                        {entry.dealer.city}
                                    </span>
                                    <span className="badge badge-neutral" style={{ marginLeft: 'auto', marginRight: '10px' }}>
                                        {entry.customerCount} customer{entry.customerCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="dealer-accordion-arrow">
                                        {expandedDealers.includes(entry.dealer.id) ? '▾' : '▸'}
                                    </span>
                                </div>

                                {expandedDealers.includes(entry.dealer.id) && (
                                    entry.customers.length === 0 ? (
                                        <div style={{ padding: '16px 20px', color: 'var(--grey-text)', fontSize: '13px', fontStyle: 'italic' }}>
                                            No customers for this dealer yet.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="std-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Phone</th>
                                                        <th>Email</th>
                                                        <th>Address</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.customers.map(c => (
                                                        <tr key={c.id}>
                                                            <td>#{c.id}</td>
                                                            <td style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</td>
                                                            <td>{c.phone}</td>
                                                            <td>{c.email || '—'}</td>
                                                            <td>{c.address || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;