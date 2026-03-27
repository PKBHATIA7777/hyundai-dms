import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getAllCars } from '../../services/carService';
import { getMyLeads } from '../../services/leadService';
import { createBooking, getMyBookings, cancelBooking } from '../../services/bookingService';
import { validatePhone, validatePAN, validateEmail, validateAdvanceAmount } from '../../utils/validators';
import './Bookings.css';

const DealerBookings = () => {

    // Bookings list
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Cars cascade
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [variants, setVariants] = useState([]);
    const [colours, setColours] = useState([]);

    // Leads for linking
    const [leads, setLeads] = useState([]);

    // Selected lead auto-fill
    const [selectedLead, setSelectedLead] = useState(null);

    // Form state
    const [form, setForm] = useState({
        firstName: '', lastName: '', phone: '',
        email: '', address: '', panNumber: '',
        variantId: '', colourId: '',
        advanceAmount: '', paymentMode: '',
        notes: '', leadId: ''
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Cancel booking state
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelError, setCancelError] = useState('');

    useEffect(() => {
        fetchBookings();
        fetchCars();
        fetchLeads();
    }, []);

    // When car changes — update variants
    useEffect(() => {
        if (selectedCarId) {
            const car = cars.find(c => c.id === Number(selectedCarId));
            setVariants(car?.variants || []);
            setForm(prev => ({ ...prev, variantId: '', colourId: '' }));
            setColours([]);
        } else {
            setVariants([]);
            setColours([]);
            setForm(prev => ({ ...prev, variantId: '', colourId: '' }));
        }
    }, [selectedCarId]);

    // When variant changes — update colours
    useEffect(() => {
        if (form.variantId) {
            const variant = variants.find(v => v.id === Number(form.variantId));
            setColours(variant?.availableColours || []);
            setForm(prev => ({ ...prev, colourId: '' }));
        } else {
            setColours([]);
            setForm(prev => ({ ...prev, colourId: '' }));
        }
    }, [form.variantId]);

    // When lead is selected — auto fill customer details
    useEffect(() => {
        if (form.leadId) {
            const lead = leads.find(l => l.id === Number(form.leadId));
            if (lead) {
                setSelectedLead(lead);
                setForm(prev => ({
                    ...prev,
                    firstName: lead.customer?.firstName || '',
                    lastName: lead.customer?.lastName || '',
                    phone: lead.customer?.phone || '',
                    email: lead.customer?.email || '',
                }));
            }
        } else {
            setSelectedLead(null);
        }
    }, [form.leadId]);

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const res = await getMyBookings();
            const data = res.data?.data ?? res.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch {
            setBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchCars = async () => {
        try {
            const res = await getAllCars();
            setCars(res.data);
        } catch {
            setCars([]);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await getMyLeads('INTERESTED');
            const data = res.data?.data ?? res.data;
            setLeads(Array.isArray(data) ? data : []);
        } catch {
            setLeads([]);
        }
    };

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
        setFormSuccess('');
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Client-side validation
        const phoneErr = validatePhone(form.phone);
        if (phoneErr) { setFormError(phoneErr); return; }

        const panErr = validatePAN(form.panNumber);
        if (panErr) { setFormError(panErr); return; }

        const emailErr = validateEmail(form.email);
        if (emailErr) { setFormError(emailErr); return; }

        // Find selected variant price for advance validation
        const selectedVariant = variants.find(v => v.id === Number(form.variantId));
        const advanceErr = validateAdvanceAmount(form.advanceAmount, selectedVariant?.price);
        if (advanceErr) { setFormError(advanceErr); return; }

        setFormLoading(true);
        try {
            const payload = {
                firstName: form.firstName || null,
                lastName: form.lastName || null,
                phone: form.phone,
                email: form.email || null,
                address: form.address || null,
                panNumber: form.panNumber || null,
                variantId: Number(form.variantId),
                colourId: Number(form.colourId),
                advanceAmount: Number(form.advanceAmount),
                paymentMode: form.paymentMode || null,
                notes: form.notes || null,
                leadId: form.leadId ? Number(form.leadId) : null
            };
            await createBooking(payload);
            setFormSuccess('Booking created successfully. Inventory reserved.');
            setForm({
                firstName: '', lastName: '', phone: '',
                email: '', address: '', panNumber: '',
                variantId: '', colourId: '',
                advanceAmount: '', paymentMode: '',
                notes: '', leadId: ''
            });
            setSelectedCarId('');
            setSelectedLead(null);
            fetchBookings();
            fetchLeads();
        } catch (err) {
            setFormError(
                err.response?.data?.error ||
                err.response?.data ||
                'Failed to create booking.'
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        setCancelError('');
        setCancellingId(bookingId);
        try {
            await cancelBooking(bookingId);
            fetchBookings();
        } catch (err) {
            setCancelError(
                err.response?.data?.error ||
                err.response?.data ||
                'Failed to cancel booking.'
            );
        } finally {
            setCancellingId(null);
        }
    };

    // Filter bookings
    const filteredBookings = activeFilter === 'ALL'
        ? bookings
        : bookings.filter(b => b.bookingStatus === activeFilter);

    const countByStatus = (status) =>
        bookings.filter(b => b.bookingStatus === status).length;

    const filters = [
        { key: 'ALL', label: 'All' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'CANCELLED', label: 'Cancelled' },
        { key: 'CONVERTED', label: 'Converted' },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '--';
        return '₹' + Number(amount).toLocaleString('en-IN');
    };

    return (
        <DealerLayout>
            <div className="bookings-page">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Bookings</h1>
                        <p>Create and manage customer bookings. Inventory is reserved automatically.</p>
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
                                {f.key === 'ALL' ? bookings.length : countByStatus(f.key)}
                            </span>
                        </button>
                    ))}
                </div>

                {cancelError && (
                    <div style={{
                        background: '#FFEBEE', border: '1px solid #FFCDD2',
                        color: 'var(--error)', padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)', fontSize: '13px'
                    }}>
                        {cancelError}
                    </div>
                )}

                <div className="bookings-layout">

                    {/* Create Booking Form */}
                    <div className="section-card">
                        <h3 className="section-title">New Booking</h3>
                        <form onSubmit={handleCreateBooking} className="inline-form">

                            {/* Link to Lead — optional */}
                            <p className="form-section-label">Link to Lead (Optional)</p>

                            <div className="form-group">
                                <label>Select Interested Lead</label>
                                <select
                                    name="leadId"
                                    value={form.leadId}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        -- Walk-in / No lead --
                                    </option>
                                    {leads.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.customer?.firstName} {l.customer?.lastName} — {l.customer?.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedLead && (
                                <div className="lead-info-box">
                                    <span className="lead-info-name">
                                        {selectedLead.customer?.firstName} {selectedLead.customer?.lastName}
                                    </span>
                                    <span className="lead-info-sub">
                                        {selectedLead.customer?.phone} — Lead #{selectedLead.id}
                                    </span>
                                </div>
                            )}

                            {/* Customer Details */}
                            <p className="form-section-label">Customer Details</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name {!form.leadId && '*'}</label>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleFormChange}
                                        placeholder="Rahul"
                                        required={!form.leadId}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name {!form.leadId && '*'}</label>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleFormChange}
                                        placeholder="Kumar"
                                        required={!form.leadId}
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
                                <label>PAN Number</label>
                                <input
                                    name="panNumber"
                                    value={form.panNumber}
                                    onChange={handleFormChange}
                                    placeholder="ABCDE1234F"
                                />
                            </div>

                            {/* Car Details */}
                            <p className="form-section-label">Car Details</p>

                            <div className="form-group">
                                <label>Select Car *</label>
                                <select
                                    value={selectedCarId}
                                    onChange={(e) => setSelectedCarId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select a car --</option>
                                    {cars.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.modelName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select Variant *</label>
                                <select
                                    name="variantId"
                                    value={form.variantId}
                                    onChange={handleFormChange}
                                    disabled={!selectedCarId}
                                    required
                                >
                                    <option value="">-- Select a variant --</option>
                                    {variants.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.variantName} — ₹{Number(v.price).toLocaleString('en-IN')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select Colour *</label>
                                <select
                                    name="colourId"
                                    value={form.colourId}
                                    onChange={handleFormChange}
                                    disabled={!form.variantId}
                                    required
                                >
                                    <option value="">-- Select a colour --</option>
                                    {colours.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.colourName} ({c.colourCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Details */}
                            <p className="form-section-label">Payment Details</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Advance Amount (₹) *</label>
                                    <input
                                        name="advanceAmount"
                                        type="number"
                                        value={form.advanceAmount}
                                        onChange={handleFormChange}
                                        placeholder="50000"
                                        min="1"
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
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    placeholder="Any special requests or delivery notes..."
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
                                disabled={formLoading}
                            >
                                {formLoading ? 'Creating...' : 'Create Booking'}
                            </button>

                        </form>
                    </div>

                    {/* Bookings List */}
                    <div>
                        <div className="table-header">
                            <h3>My Bookings ({filteredBookings.length})</h3>
                            <button className="btn-refresh" onClick={fetchBookings}>
                                Refresh
                            </button>
                        </div>

                        {bookingsLoading ? (
                            <div className="loading-state">Loading bookings...</div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="empty-state">
                                {activeFilter === 'ALL'
                                    ? 'No bookings yet. Create your first booking.'
                                    : `No bookings with status ${activeFilter}.`
                                }
                            </div>
                        ) : (
                            <div className="bookings-list">
                                {filteredBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className={`booking-card status-${booking.bookingStatus}`}
                                    >
                                        <div className="booking-card-top">
                                            <div className="booking-card-left">
                                                <div className="booking-customer-name">
                                                    {booking.customer?.firstName} {booking.customer?.lastName}
                                                </div>
                                                <div className="booking-customer-phone">
                                                    {booking.customer?.phone}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                <span className={`status-badge status-${booking.bookingStatus}`}>
                                                    {booking.bookingStatus}
                                                </span>
                                                {booking.lead && (
                                                    <span className="lead-tag">
                                                        🔗 Lead #{booking.lead.id}
                                                    </span>
                                                )}
                                                {booking.bookingStatus === 'CONFIRMED' && (
                                                    <button
                                                        style={{
                                                            padding: '4px 10px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            background: '#FFEBEE',
                                                            color: 'var(--error)',
                                                            border: '1px solid #FFCDD2',
                                                            borderRadius: '20px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onClick={() => {
                                                            if (window.confirm(`Cancel booking for ${booking.customer?.firstName} ${booking.customer?.lastName}? This will release the reserved inventory.`)) {
                                                                handleCancelBooking(booking.id);
                                                            }
                                                        }}
                                                        disabled={cancellingId === booking.id}
                                                    >
                                                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="booking-details-grid">
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Car</span>
                                                <span className="booking-detail-value">
                                                    {booking.variant?.car?.modelName || '--'}
                                                </span>
                                            </div>
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Variant</span>
                                                <span className="booking-detail-value">
                                                    {booking.variant?.variantName}
                                                </span>
                                            </div>
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Colour</span>
                                                <span className="booking-detail-value">
                                                    <span className="colour-dot">
                                                        <span
                                                            className="colour-swatch"
                                                            style={{
                                                                background: booking.colour?.colourCode?.startsWith('#')
                                                                    ? booking.colour.colourCode
                                                                    : '#ccc'
                                                            }}
                                                        />
                                                        {booking.colour?.colourName}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Advance</span>
                                                <span className="booking-detail-value advance-amount">
                                                    {formatCurrency(booking.advanceAmount)}
                                                </span>
                                            </div>
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Payment</span>
                                                <span className="booking-detail-value">
                                                    {booking.paymentMode || '--'}
                                                </span>
                                            </div>
                                            <div className="booking-detail-item">
                                                <span className="booking-detail-label">Date</span>
                                                <span className="booking-detail-value">
                                                    {formatDate(booking.bookingDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="booking-notes">
                                                {booking.notes}
                                            </div>
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

export default DealerBookings;