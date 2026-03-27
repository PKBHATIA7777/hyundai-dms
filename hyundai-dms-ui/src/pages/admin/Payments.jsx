import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getTypeStyle = (type) => {
    const styles = {
        ADVANCE:  { background: '#E3F2FD', color: '#1565C0' },
        REMAINING: { background: '#E8F5E9', color: '#2E7D32' },
        LOAN:     { background: '#FFF8E1', color: '#E65100' },
        REFUND:   { background: '#FFEBEE', color: '#C62828' },
    };
    return styles[type] || { background: '#F5F5F5', color: '#757575' };
};

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/payments');
            const data = res.data?.data ?? res.data;
            setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load payments.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const filtered = payments.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.paymentType?.toLowerCase().includes(q) ||
            p.paymentMode?.toLowerCase().includes(q) ||
            p.dealer?.name?.toLowerCase().includes(q) ||
            String(p.sale?.id).includes(q)
        );
    });

    const totalRevenue = payments
        .filter(p => p.paymentType !== 'REFUND')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                        Payments
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--grey-text)' }}>
                        All payment transactions across the dealer network.
                    </p>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Transactions', value: payments.length },
                        { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
                        { label: 'Advance Payments', value: payments.filter(p => p.paymentType === 'ADVANCE').length },
                        { label: 'Loan Payments', value: payments.filter(p => p.paymentType === 'LOAN').length },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: 'var(--white)', borderRadius: 'var(--radius-sm)',
                            padding: '16px 22px', boxShadow: 'var(--shadow-sm)',
                            borderLeft: '3px solid var(--purple-main)', minWidth: '160px'
                        }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--grey-text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--purple-main)', marginTop: '4px' }}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by dealer, type, mode or sale ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '10px 16px', border: '1.5px solid var(--grey-mid)',
                        borderRadius: 'var(--radius-sm)', fontSize: '14px',
                        width: '340px', outline: 'none'
                    }}
                />

                {error && (
                    <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* Table */}
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--grey-mid)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                            All Payments ({filtered.length})
                        </h3>
                        <button onClick={fetchPayments} style={{
                            background: 'transparent', border: '1.5px solid var(--purple-border)',
                            color: 'var(--purple-main)', padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer'
                        }}>
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '40px' }}>Loading payments...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--grey-text)', padding: '40px' }}>No payments found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Sale #', 'Dealer', 'Type', 'Amount', 'Mode', 'Date', 'Notes'].map(h => (
                                            <th key={h} style={{
                                                background: 'var(--purple-soft)', color: 'var(--purple-dark)',
                                                fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: '0.5px', padding: '13px 16px', textAlign: 'left'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(payment => {
                                        const typeStyle = getTypeStyle(payment.paymentType);
                                        return (
                                            <tr key={payment.id} style={{ borderBottom: '1px solid var(--grey-mid)' }}>
                                                <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                                    <span style={{ fontFamily: 'monospace', background: 'var(--purple-soft)', color: 'var(--purple-dark)', padding: '2px 8px', borderRadius: '4px' }}>
                                                        #{payment.sale?.id}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600 }}>
                                                    {payment.dealer?.name}
                                                </td>
                                                <td style={{ padding: '13px 16px' }}>
                                                    <span style={{ ...typeStyle, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                                        {payment.paymentType}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                                    {payment.paymentMode || '--'}
                                                </td>
                                                <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--grey-text)' }}>
                                                    {formatDate(payment.paymentDate)}
                                                </td>
                                                <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--grey-text)', fontStyle: 'italic', maxWidth: '200px' }}>
                                                    <span title={payment.notes} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {payment.notes || '--'}
                                                    </span>
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

export default AdminPayments;