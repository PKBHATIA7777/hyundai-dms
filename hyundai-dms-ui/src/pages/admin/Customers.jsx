import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import './Customers.css';

const AdminCustomers = () => {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [byDealerData, setByDealerData] = useState([]);
    const [expandedDealers, setExpandedDealers] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchCustomers = useCallback(async (searchTerm = '') => {
        setLoading(true);
        setError('');
        try {
            const url = searchTerm
                ? `/admin/customers?search=${encodeURIComponent(searchTerm)}`
                : '/admin/customers';
            const res = await api.get(url);
            setCustomers(res.data);
        } catch (err) {
            setError(err.response?.data || 'Failed to load customers.');
        } finally {
            setLoading(false);
        }
    }, []);

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
        if (activeTab === 'all') {
            fetchCustomers();
        } else {
            fetchByDealer();
        }
    }, [activeTab, fetchCustomers, fetchByDealer]);

    const toggleDealer = (dealerId) => {
        setExpandedDealers(prev =>
            prev.includes(dealerId)
                ? prev.filter(id => id !== dealerId)
                : [...prev, dealerId]
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        fetchCustomers(searchInput);
    };

    const handleClear = () => {
        setSearch('');
        setSearchInput('');
        fetchCustomers('');
    };

    return (
        <AdminLayout>
            <div className="customers-page">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Customers</h1>
                        <p>All customers registered through bookings and sales across the network.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={activeTab === 'all' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('all')}
                    >
                        All Customers
                    </button>
                    <button
                        className={activeTab === 'dealer' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('dealer')}
                    >
                        By Dealer
                    </button>
                </div>

                {/* Stats */}
                {activeTab === 'all' && (
                    <div className="stats-row">
                        <div className="stat-pill">
                            <span className="stat-pill-label">Total Customers</span>
                            <span className="stat-pill-value">{customers.length}</span>
                        </div>
                    </div>
                )}

                {/* Search only for All Customers */}
                {activeTab === 'all' && (
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="btn-search">
                            Search
                        </button>
                        {search && (
                            <button
                                type="button"
                                className="btn-clear"
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                {/* ================= ALL CUSTOMERS ================= */}
                {activeTab === 'all' && (
                    <div className="table-wrapper">
                        <div className="table-header">
                            <h3>
                                {search
                                    ? `Search results for "${search}" (${customers.length})`
                                    : `All Customers (${customers.length})`
                                }
                            </h3>
                            <button
                                className="btn-refresh"
                                onClick={() => fetchCustomers(search)}
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading customers...</div>
                        ) : customers.length === 0 ? (
                            <div className="empty-state">
                                {search
                                    ? `No customers found matching "${search}".`
                                    : 'No customers registered yet.'
                                }
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>PAN Number</th>
                                            <th>Dealer</th>
                                            <th>Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(customer => (
                                            <tr
                                                key={customer.id}
                                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>#{customer.id}</td>
                                                <td>{customer.firstName} {customer.lastName}</td>
                                                <td>{customer.phone}</td>
                                                <td>{customer.email || <span className="no-data">—</span>}</td>
                                                <td>{customer.panNumber || <span className="no-data">—</span>}</td>

                                                {/* Dealer column */}
                                                <td>
                                                    {customer.dealerName || (
                                                        <span className="no-data">—</span>
                                                    )}
                                                </td>

                                                <td>{customer.address || <span className="no-data">—</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ================= BY DEALER ================= */}
                {activeTab === 'dealer' && (
                    <div className="dealer-accordion">
                        {loading ? (
                            <div className="loading-state">Loading dealer data...</div>
                        ) : byDealerData.length === 0 ? (
                            <div className="empty-state">No dealer data available.</div>
                        ) : (
                            byDealerData.map(entry => (
                                <div key={entry.dealer.id} className="dealer-accordion-item">
                                    <div
                                        className="dealer-accordion-header"
                                        onClick={() => toggleDealer(entry.dealer.id)}
                                    >
                                        <span className="dealer-accordion-name">
                                            {entry.dealer.name}
                                        </span>
                                        <span className="badge badge-neutral">
                                            {entry.customerCount} customers
                                        </span>
                                        <span className="dealer-accordion-arrow">
                                            {expandedDealers.includes(entry.dealer.id) ? '▾' : '▸'}
                                        </span>
                                    </div>

                                    {expandedDealers.includes(entry.dealer.id) && (
                                        <table className="std-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry.customers.map(c => (
                                                    <tr key={c.id}>
                                                        <td>#{c.id}</td>
                                                        <td>{c.firstName} {c.lastName}</td>
                                                        <td>{c.phone}</td>
                                                        <td>{c.email || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;