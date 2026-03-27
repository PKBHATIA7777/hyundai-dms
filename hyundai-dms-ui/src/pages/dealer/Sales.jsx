import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getMyBookings } from '../../services/bookingService';
import { createSale, getMySales } from '../../services/saleService';
import './Sales.css';

const DealerSales = () => {

    // Sales list
    const [sales, setSales] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Confirmed bookings available for conversion
    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Form state
    const [form, setForm] = useState({
        bookingId: '',
        remainingAmount: '',
        paymentMode: '',
        loanBank: '',
        loanReferenceNumber: '',
        notes: ''
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchSales();
        fetchConfirmedBookings();
    }, []);

    // When booking is selected — auto fill advance amount info
    useEffect(() => {
        if (form.bookingId) {
            const booking = confirmedBookings.find(
                b => b.id === Number(form.bookingId)
            );
            setSelectedBooking(booking || null);
            // Reset remaining amount when booking changes
            setForm(prev => ({ ...prev, remainingAmount: '' }));
        } else {
            setSelectedBooking(null);
        }
    }, [form.bookingId]);

   const fetchSales = async () => {
    setSalesLoading(true);
    try {
        const res = await getMySales();
        // Backend wraps in ApiResponse: { success, data, timestamp }
        const data = res.data?.data ?? res.data;
        setSales(Array.isArray(data) ? data : []);
    } catch {
        setSales([]);
    } finally {
        setSalesLoading(false);
    }
};

  const fetchConfirmedBookings = async () => {
    try {
        const res = await getMyBookings('CONFIRMED');
        const data = res.data?.data ?? res.data;
        setConfirmedBookings(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error('Failed to load confirmed bookings:', err);
        setConfirmedBookings([]);
    }
};

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
        setFormSuccess('');
    };

    const handleCreateSale = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setFormLoading(true);

        try {
            const payload = {
                bookingId: Number(form.bookingId),
                remainingAmount: Number(form.remainingAmount) || 0,
                paymentMode: form.paymentMode || null,
                loanBank: form.loanBank || null,
                loanReferenceNumber: form.loanReferenceNumber || null,
                notes: form.notes || null
            };

            await createSale(payload);
            setFormSuccess('Sale completed successfully. Inventory updated.');

            // Reset form
            setForm({
                bookingId: '',
                remainingAmount: '',
                paymentMode: '',
                loanBank: '',
                loanReferenceNumber: '',
                notes: ''
            });
            setSelectedBooking(null);

            // Refresh both lists
            fetchSales();
            fetchConfirmedBookings();

        } catch (err) {
            setFormError(err.response?.data || 'Failed to complete sale.');
        } finally {
            setFormLoading(false);
        }
    };

    // Calculate total from selected booking
    const calculateTotal = () => {
        if (!selectedBooking) return null;
        const advance = selectedBooking.advanceAmount || 0;
        const remaining = Number(form.remainingAmount) || 0;
        return advance + remaining;
    };

    // Filter sales
    const filteredSales = activeFilter === 'ALL'
        ? sales
        : sales.filter(s => s.saleStatus === activeFilter);

    const countByStatus = (status) =>
        sales.filter(s => s.saleStatus === status).length;

    const filters = [
        { key: 'ALL', label: 'All' },
        { key: 'COMPLETED', label: 'Completed' },
        { key: 'CANCELLED', label: 'Cancelled' },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '--';
        return '₹' + Number(amount).toLocaleString('en-IN');
    };

    // Print Invoice Handler
    const handlePrintInvoice = (sale) => {
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sale Invoice #${sale.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #1A1A2E; }
                    h1 { color: #5B2D8E; margin-bottom: 4px; }
                    .subtitle { color: #757575; margin-bottom: 32px; font-size: 14px; }
                    .section { margin-bottom: 24px; }
                    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase;
                        letter-spacing: 0.5px; color: #757575; margin-bottom: 10px;
                        padding-bottom: 6px; border-bottom: 1px solid #E0E0E0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                    .field-label { font-size: 11px; color: #757575; font-weight: 600; }
                    .field-value { font-size: 14px; font-weight: 600; margin-top: 2px; }
                    .total { font-size: 22px; font-weight: 700; color: #2E7D32; }
                    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E0E0E0;
                        font-size: 12px; color: #757575; text-align: center; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>Hyundai DMS</h1>
                <div class="subtitle">Sale Invoice — Dealer Copy</div>

                <div class="section">
                    <div class="section-title">Invoice Details</div>
                    <div class="grid">
                        <div><div class="field-label">Sale ID</div><div class="field-value">#${sale.id}</div></div>
                        <div><div class="field-label">Sale Date</div><div class="field-value">${new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
                        <div><div class="field-label">Booking Reference</div><div class="field-value">#${sale.booking?.id}</div></div>
                        <div><div class="field-label">Status</div><div class="field-value">${sale.saleStatus}</div></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Customer Details</div>
                    <div class="grid">
                        <div><div class="field-label">Name</div><div class="field-value">${sale.customer?.firstName} ${sale.customer?.lastName}</div></div>
                        <div><div class="field-label">Phone</div><div class="field-value">${sale.customer?.phone}</div></div>
                        ${sale.customer?.email ? `<div><div class="field-label">Email</div><div class="field-value">${sale.customer.email}</div></div>` : ''}
                        ${sale.customer?.panNumber ? `<div><div class="field-label">PAN</div><div class="field-value">${sale.customer.panNumber}</div></div>` : ''}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Vehicle Details</div>
                    <div class="grid">
                        <div><div class="field-label">Model</div><div class="field-value">${sale.variant?.car?.modelName || '--'}</div></div>
                        <div><div class="field-label">Variant</div><div class="field-value">${sale.variant?.variantName}</div></div>
                        <div><div class="field-label">Colour</div><div class="field-value">${sale.colour?.colourName} (${sale.colour?.colourCode})</div></div>
                        <div><div class="field-label">Payment Mode</div><div class="field-value">${sale.paymentMode || '--'}</div></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Payment Breakdown</div>
                    <div class="grid">
                        <div><div class="field-label">Advance Paid</div><div class="field-value">₹${Number(sale.advancePaid).toLocaleString('en-IN')}</div></div>
                        <div><div class="field-label">Remaining Amount</div><div class="field-value">₹${Number(sale.remainingAmount).toLocaleString('en-IN')}</div></div>
                        <div><div class="field-label">Vehicle Amount</div><div class="field-value">₹${Number(sale.totalAmount).toLocaleString('en-IN')}</div></div>
                        <div><div class="field-label">Grand Total</div><div class="field-value total">₹${Number(sale.grandTotal || sale.totalAmount).toLocaleString('en-IN')}</div></div>
                    </div>
                </div>

                <div class="footer">
                    This is a computer-generated invoice. Thank you for choosing Hyundai.
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(invoiceHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    const isLoan = form.paymentMode === 'Loan';

    return (
        <DealerLayout>
            <div className="sales-page">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Sales</h1>
                        <p>Convert confirmed bookings into completed sales.</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            <span className="chip-count">
                                {f.key === 'ALL' ? sales.length : countByStatus(f.key)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="sales-layout">

                    {/* Create Sale Form */}
                    <div className="section-card">
                        <h3 className="section-title">Complete a Sale</h3>
                        <form onSubmit={handleCreateSale} className="inline-form">

                            {/* Booking Selection */}
                            <p className="form-section-label">Select Booking</p>

                            <div className="form-group">
                                <label>Confirmed Booking *</label>
                                <select
                                    name="bookingId"
                                    value={form.bookingId}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">
                                        {confirmedBookings.length === 0
                                            ? '-- No confirmed bookings available --'
                                            : '-- Select a confirmed booking --'
                                        }
                                    </option>
                                    {confirmedBookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            #{b.id} — {b.customer?.firstName} {b.customer?.lastName}
                                            {' '}({b.variant?.variantName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Booking Summary */}
                            {selectedBooking && (
                                <div className="booking-summary-box">
                                    <div className="booking-summary-row">
                                        <span className="booking-summary-label">Customer</span>
                                        <span className="booking-summary-value">
                                            {selectedBooking.customer?.firstName}{' '}
                                            {selectedBooking.customer?.lastName}
                                        </span>
                                    </div>
                                    <div className="booking-summary-row">
                                        <span className="booking-summary-label">Car</span>
                                        <span className="booking-summary-value">
                                            {selectedBooking.variant?.car?.modelName}{' '}
                                            {selectedBooking.variant?.variantName}
                                        </span>
                                    </div>
                                    <div className="booking-summary-row">
                                        <span className="booking-summary-label">Advance Paid</span>
                                        <span className="booking-summary-value">
                                            {formatCurrency(selectedBooking.advanceAmount)}
                                        </span>
                                    </div>
                                    {calculateTotal() !== null && (
                                        <div className="booking-summary-row booking-summary-total">
                                            <span className="booking-summary-label">Total Amount</span>
                                            <span className="booking-summary-value">
                                                {formatCurrency(calculateTotal())}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Details */}
                            <p className="form-section-label">Payment Details</p>

                            <div className="form-group">
                                <label>Remaining Amount (₹) *</label>
                                <input
                                    name="remainingAmount"
                                    type="number"
                                    value={form.remainingAmount}
                                    onChange={handleFormChange}
                                    placeholder="0 if fully paid via advance"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Payment Mode</label>
                                <select
                                    name="paymentMode"
                                    value={form.paymentMode}
                                    onChange={handleFormChange}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Loan">Loan</option>
                                </select>
                            </div>

                            {/* Loan Fields — only shown when Loan is selected */}
                            {isLoan && (
                                <div className="loan-fields">
                                    <p className="loan-fields-title">Loan Details</p>
                                    <div className="form-group">
                                        <label>Bank Name</label>
                                        <input
                                            name="loanBank"
                                            value={form.loanBank}
                                            onChange={handleFormChange}
                                            placeholder="e.g. HDFC Bank"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Loan Reference Number</label>
                                        <input
                                            name="loanReferenceNumber"
                                            value={form.loanReferenceNumber}
                                            onChange={handleFormChange}
                                            placeholder="e.g. LN2024001234"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            {formError && (
                                <div className="alert alert-error">{formError}</div>
                            )}
                            {formSuccess && (
                                <div className="alert alert-success">{formSuccess}</div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={
                                    formLoading ||
                                    !form.bookingId
                                }
                            >
                                {formLoading ? 'Processing...' : 'Complete Sale'}
                            </button>

                        </form>
                    </div>

                    {/* Sales List */}
                    <div>
                        <div className="table-header">
                            <h3>My Sales ({filteredSales.length})</h3>
                            <button className="btn-refresh" onClick={fetchSales}>
                                Refresh
                            </button>
                        </div>

                        {salesLoading ? (
                            <div className="loading-state">Loading sales...</div>
                        ) : filteredSales.length === 0 ? (
                            <div className="empty-state">
                                {activeFilter === 'ALL'
                                    ? 'No sales yet. Complete your first sale.'
                                    : `No sales with status ${activeFilter}.`
                                }
                            </div>
                        ) : (
                            <div className="sales-list">
                                {filteredSales.map(sale => (
                                    <div key={sale.id} className="sale-card">

                                        <div className="sale-card-top">
                                            <div className="sale-card-left">
                                                <div className="sale-customer-name">
                                                    {sale.customer?.firstName} {sale.customer?.lastName}
                                                </div>
                                                <div className="sale-customer-phone">
                                                    {sale.customer?.phone}
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${sale.saleStatus}`}>
                                                {sale.saleStatus}
                                            </span>
                                        </div>

                                        <div className="sale-details-grid">
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Car</span>
                                                <span className="sale-detail-value">
                                                    {sale.variant?.car?.modelName || '--'}
                                                </span>
                                            </div>
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Variant</span>
                                                <span className="sale-detail-value">
                                                    {sale.variant?.variantName}
                                                </span>
                                            </div>
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Colour</span>
                                                <span className="sale-detail-value">
                                                    <span className="colour-dot">
                                                        <span
                                                            className="colour-swatch"
                                                            style={{
                                                                background: sale.colour?.colourCode?.startsWith('#')
                                                                    ? sale.colour.colourCode
                                                                    : '#ccc'
                                                            }}
                                                        />
                                                        {sale.colour?.colourName}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Total</span>
                                                <span className="sale-detail-value total-amount">
                                                    {formatCurrency(sale.totalAmount)}
                                                </span>
                                            </div>
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Date</span>
                                                <span className="sale-detail-value">
                                                    {formatDate(sale.saleDate)}
                                                </span>
                                            </div>
                                            <div className="sale-detail-item">
                                                <span className="sale-detail-label">Booking</span>
                                                <span className="sale-detail-value">
                                                    #{sale.booking?.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Payment Breakdown */}
                                        <div className="payment-breakdown">
                                            <div className="payment-tag">
                                                <span className="payment-tag-type">Advance</span>
                                                <span className="payment-tag-amount">
                                                    {formatCurrency(sale.advancePaid)}
                                                </span>
                                            </div>
                                            {sale.remainingAmount > 0 && (
                                                <div className="payment-tag">
                                                    <span className="payment-tag-type">
                                                        {sale.paymentMode === 'Loan' ? 'Loan' : 'Remaining'}
                                                    </span>
                                                    <span className="payment-tag-amount">
                                                        {formatCurrency(sale.remainingAmount)}
                                                    </span>
                                                </div>
                                            )}
                                            {sale.paymentMode && (
                                                <div className="payment-tag">
                                                    <span className="payment-tag-type">Mode</span>
                                                    <span className="payment-tag-amount">
                                                        {sale.paymentMode}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Print Invoice Button */}
                                        <div style={{ marginTop: '10px' }}>
                                            <button
                                                onClick={() => handlePrintInvoice(sale)}
                                                style={{
                                                    padding: '6px 14px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    background: 'var(--purple-soft)',
                                                    color: 'var(--purple-main)',
                                                    border: '1px solid var(--purple-border)',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => {
                                                    e.target.style.background = 'var(--purple-main)';
                                                    e.target.style.color = 'white';
                                                }}
                                                onMouseOut={e => {
                                                    e.target.style.background = 'var(--purple-soft)';
                                                    e.target.style.color = 'var(--purple-main)';
                                                }}
                                            >
                                                🖨 Print Invoice
                                            </button>
                                        </div>

                                        {sale.notes && (
                                            <div className="sale-notes">{sale.notes}</div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DealerLayout>
    );
};

export default DealerSales;