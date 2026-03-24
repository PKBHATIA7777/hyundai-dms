import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import './Customers.css';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
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

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

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

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-pill">
                        <span className="stat-pill-label">Total Customers</span>
                        <span className="stat-pill-value">{customers.length}</span>
                    </div>
                </div>

                {/* Search Bar */}
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

                {error && <div className="alert alert-error">{error}</div>}

                {/* Table */}
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
                                : 'No customers registered yet. They are created automatically through bookings.'
                            }
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>PAN Number</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>
                                            <span className="customer-id">
                                                #{customer.id}
                                            </span>
                                        </td>
                                        <td className="customer-name">
                                            {customer.firstName} {customer.lastName}
                                        </td>
                                        <td>{customer.phone}</td>
                                        <td>
                                            {customer.email
                                                ? customer.email
                                                : <span className="no-data">—</span>
                                            }
                                        </td>
                                        <td>
                                            {customer.panNumber
                                                ? <span className="pan-badge">{customer.panNumber}</span>
                                                : <span className="no-data">—</span>
                                            }
                                        </td>
                                        <td>
                                            {customer.address
                                                ? customer.address
                                                : <span className="no-data">—</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;