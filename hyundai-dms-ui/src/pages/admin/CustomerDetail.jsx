import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';

const formatCurrency = (amount) =>
    amount ? '₹' + Number(amount).toLocaleString('en-IN') : '₹0';

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const AdminCustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [custRes, salesRes] = await Promise.all([
                    api.get(`/admin/customers/${id}`),
                    api.get(`/admin/customers/${id}/sales`)
                ]);
                setCustomer(custRes.data);
                const salesData = salesRes.data?.data ?? salesRes.data;
                setSales(Array.isArray(salesData) ? salesData : []);
            } catch (err) {
                setError(err.response?.data || 'Failed to load customer details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const totalSpent = sales.reduce((sum, s) => sum + (s.grandTotal || s.totalAmount || 0), 0);

    if (loading) return <AdminLayout><div style={{ padding: '40px', textAlign: 'center', color: 'var(--grey-text)' }}>Loading customer details...</div></AdminLayout>;
    if (error) return <AdminLayout><div style={{ padding: '20px', background: '#FFEBEE', color: 'var(--error)', borderRadius: 'var(--radius-sm)' }}>{error}</div></AdminLayout>;
    if (!customer) return null;

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Back Button + Header */}
                <div>
                    <button onClick={() => navigate('/admin/customers')} style={{
                        background: 'none', border: 'none', color: 'var(--purple-main)',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        padding: '0', marginBottom: '12px'
                    }}>
                        ← Back to Customers
                    </button>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                        {customer.firstName} {customer.lastName}
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>Customer #{customer.id}</p>
                </div>

                {/* Customer Info Card */}
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--grey-mid)' }}>
                        Customer Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {[
                            { label: 'Phone', value: customer.phone },
                            { label: 'Email', value: customer.email || '—' },
                            { label: 'PAN Number', value: customer.panNumber || '—' },
                            { label: 'Address', value: customer.address || '—' },
                            { label: 'Total Purchases', value: sales.length },
                            { label: 'Total Spent', value: formatCurrency(totalSpent) },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grey-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Purchase History */}
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--grey-mid)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                            Purchase History ({sales.length})
                        </h3>
                    </div>

                    {sales.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '40px', fontSize: '14px' }}>
                            No purchases found for this customer.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Sale #', 'Dealer', 'Car', 'Variant', 'Colour', 'Total', 'Date', 'Status'].map(h => (
                                            <th key={h} style={{
                                                background: 'var(--purple-soft)', color: 'var(--purple-dark)',
                                                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: '0.5px', padding: '13px 16px', textAlign: 'left'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(sale => (
                                        <tr key={sale.id} style={{ borderBottom: '1px solid var(--grey-mid)' }}>
                                            <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                                <span style={{ fontFamily: 'monospace', background: 'var(--purple-soft)', color: 'var(--purple-dark)', padding: '2px 8px', borderRadius: '4px' }}>
                                                    #{sale.id}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px' }}>{sale.dealer?.name}</td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px' }}>{sale.variant?.car?.modelName || '--'}</td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px' }}>{sale.variant?.variantName}</td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: sale.colour?.colourCode?.startsWith('#') ? sale.colour.colourCode : '#ccc', border: '1px solid var(--grey-mid)', flexShrink: 0 }} />
                                                    {sale.colour?.colourName}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
                                                {formatCurrency(sale.grandTotal || sale.totalAmount)}
                                            </td>
                                            <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--grey-text)' }}>
                                                {formatDate(sale.saleDate)}
                                            </td>
                                            <td style={{ padding: '13px 16px' }}>
                                                <span style={{
                                                    background: sale.saleStatus === 'COMPLETED' ? '#E8F5E9' : '#FFEBEE',
                                                    color: sale.saleStatus === 'COMPLETED' ? 'var(--success)' : 'var(--error)',
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
                                                }}>
                                                    {sale.saleStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCustomerDetail;