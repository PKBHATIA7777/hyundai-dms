import { useState, useEffect } from 'react';
import DealerLayout from '../../layouts/DealerLayout';
import { getAllCars } from '../../services/carService';
import { createLead, getMyLeads, updateLeadStatus } from '../../services/leadService';
import './Leads.css';

const STATUS_FLOW = {
    NEW: ['CONTACTED', 'LOST'],
    CONTACTED: ['INTERESTED', 'LOST'],
    INTERESTED: ['LOST'],
    BOOKED: [],
    LOST: []
};

const DealerLeads = () => {
    // Leads list
    const [leads, setLeads] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Cars for variant dropdown
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [variants, setVariants] = useState([]);

    // Form state
    const [form, setForm] = useState({
        firstName: '', lastName: '', phone: '',
        email: '', address: '', source: '',
        variantId: '', notes: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Status update loading
    const [statusLoading, setStatusLoading] = useState(null);

    useEffect(() => {
        fetchLeads();
        fetchCars();
    }, []);

    useEffect(() => {
        if (selectedCarId) {
            const car = cars.find(c => c.id === Number(selectedCarId));
            setVariants(car?.variants || []);
            setForm(prev => ({ ...prev, variantId: '' }));
        } else {
            setVariants([]);
            setForm(prev => ({ ...prev, variantId: '' }));
        }
    }, [selectedCarId]);

    const fetchLeads = async () => {
        setLeadsLoading(true);
        try {
            const res = await getMyLeads();
            setLeads(res.data);
        } catch {
            setLeads([]);
        } finally {
            setLeadsLoading(false);
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

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
        setFormSuccess('');
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setFormLoading(true);

        try {
            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone,
                email: form.email || null,
                address: form.address || null,
                source: form.source || null,
                variantId: form.variantId ? Number(form.variantId) : null,
                notes: form.notes || null
            };

            await createLead(payload);
            setFormSuccess('Lead created successfully.');
            setForm({
                firstName: '', lastName: '', phone: '',
                email: '', address: '', source: '',
                variantId: '', notes: ''
            });
            setSelectedCarId('');
            fetchLeads();
        } catch (err) {
            setFormError(err.response?.data || 'Failed to create lead.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        setStatusLoading(leadId + newStatus);
        try {
            await updateLeadStatus(leadId, newStatus);
            fetchLeads();
        } catch (err) {
            alert(err.response?.data || 'Failed to update status.');
        } finally {
            setStatusLoading(null);
        }
    };

    // Filter leads
    const filteredLeads = activeFilter === 'ALL'
        ? leads
        : leads.filter(l => l.status === activeFilter);

    // Count per status
    const countByStatus = (status) => leads.filter(l => l.status === status).length;

    const filters = [
        { key: 'ALL', label: 'All' },
        { key: 'NEW', label: 'New' },
        { key: 'CONTACTED', label: 'Contacted' },
        { key: 'INTERESTED', label: 'Interested' },
        { key: 'BOOKED', label: 'Booked' },
        { key: 'LOST', label: 'Lost' },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <DealerLayout>
            <div className="leads-page">

                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Leads</h1>
                        <p>Manage your sales pipeline and track customer interest.</p>
                    </div>
                </div>

                {/* Pipeline Filter Bar */}
                <div className="pipeline-bar">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            className={`pipeline-chip ${activeFilter === f.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            <span className="chip-count">
                                {f.key === 'ALL' ? leads.length : countByStatus(f.key)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="leads-layout">

                    {/* Create Lead Form */}
                    <div className="section-card">
                        <h3 className="section-title">Add New Lead</h3>
                        <form onSubmit={handleCreateLead} className="inline-form">

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleFormChange}
                                        placeholder="Rahul"
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
                                    placeholder="rahul@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Source</label>
                                <select
                                    name="source"
                                    value={form.source}
                                    onChange={handleFormChange}
                                >
                                    <option value="">-- Select source --</option>
                                    <option value="Walk-in">Walk-in</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Online">Online</option>
                                    <option value="Referral">Referral</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Interested In — Car</label>
                                <select
                                    value={selectedCarId}
                                    onChange={(e) => setSelectedCarId(e.target.value)}
                                >
                                    <option value="">-- Select car --</option>
                                    {cars.map(c => (
                                        <option key={c.id} value={c.id}>{c.modelName}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedCarId && (
                                <div className="form-group">
                                    <label>Interested In — Variant</label>
                                    <select
                                        name="variantId"
                                        value={form.variantId}
                                        onChange={handleFormChange}
                                    >
                                        <option value="">-- Select variant --</option>
                                        {variants.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.variantName} — ₹{Number(v.price).toLocaleString('en-IN')}
                                            </option>
                                        ))}
                                    </select>
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

                            {formError && <div className="alert alert-error">{formError}</div>}
                            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Creating...' : '+ Add Lead'}
                            </button>

                        </form>
                    </div>

                    {/* Leads List */}
                    <div>
                        {leadsLoading ? (
                            <div className="loading-state">Loading leads...</div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="empty-state">
                                {activeFilter === 'ALL'
                                    ? 'No leads yet. Add your first lead.'
                                    : `No leads with status ${activeFilter}.`
                                }
                            </div>
                        ) : (
                            <div className="leads-list">
                                {filteredLeads.map(lead => (
                                    <div
                                        key={lead.id}
                                        className={`lead-card status-${lead.status}`}
                                    >
                                        <div className="lead-card-top">
                                            <div>
                                                <div className="lead-customer-name">
                                                    {lead.customer?.firstName} {lead.customer?.lastName}
                                                </div>
                                                <div className="lead-customer-phone">
                                                    {lead.customer?.phone}
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${lead.status}`}>
                                                {lead.status}
                                            </span>
                                        </div>

                                        <div className="lead-card-meta">
                                            {lead.source && (
                                                <span className="lead-meta-item">
                                                    📍 {lead.source}
                                                </span>
                                            )}
                                            {lead.interestedVariant && (
                                                <span className="lead-meta-item">
                                                    🚗 {lead.interestedVariant.variantName}
                                                </span>
                                            )}
                                            <span className="lead-meta-item">
                                                📅 {formatDate(lead.createdAt)}
                                            </span>
                                        </div>

                                        {lead.notes && (
                                            <div className="lead-notes">
                                                {lead.notes}
                                            </div>
                                        )}

                                        {/* Status Update Buttons */}
                                        {STATUS_FLOW[lead.status]?.length > 0 && (
                                            <div className="lead-card-actions">
                                                <span className="status-update-label">
                                                    Move to:
                                                </span>
                                                {STATUS_FLOW[lead.status].map(nextStatus => (
                                                    <button
                                                        key={nextStatus}
                                                        className={`status-btn status-btn-${nextStatus.toLowerCase()}`}
                                                        onClick={() => handleStatusUpdate(lead.id, nextStatus)}
                                                        disabled={statusLoading === lead.id + nextStatus}
                                                    >
                                                        {statusLoading === lead.id + nextStatus
                                                            ? '...'
                                                            : nextStatus
                                                        }
                                                    </button>
                                                ))}
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

export default DealerLeads;