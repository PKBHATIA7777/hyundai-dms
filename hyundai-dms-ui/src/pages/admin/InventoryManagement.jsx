import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { addStock, getInventoryByDealerId } from '../../services/inventoryService';
import { getAllCars } from '../../services/carService';
import api from '../../services/api';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Read dealerId and dealerName from URL params
    const urlDealerId = searchParams.get('dealerId');
    const urlDealerName = searchParams.get('dealerName');

    // Dealers dropdown
    const [dealers, setDealers] = useState([]);

    // Selected dealer
    const [selectedDealerId, setSelectedDealerId] = useState(urlDealerId || '');
    const [selectedDealerName, setSelectedDealerName] = useState(urlDealerName || '');

    // Cascading dropdowns
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [variants, setVariants] = useState([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [colours, setColours] = useState([]);
    const [selectedColourId, setSelectedColourId] = useState('');

    // Quantity
    const [quantity, setQuantity] = useState('');

    // Inventory table
    const [inventory, setInventory] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);

    // Form feedback
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // On page load — fetch dealers and cars
    useEffect(() => {
        fetchDealers();
        fetchCars();
    }, []);

    // When dealer is selected — fetch their inventory
    useEffect(() => {
        if (selectedDealerId) {
            fetchInventory(selectedDealerId);
        } else {
            setInventory([]);
        }
    }, [selectedDealerId]);

    // When car is selected — populate variants
    useEffect(() => {
        if (selectedCarId) {
            const selectedCar = cars.find(c => c.id === Number(selectedCarId));
            setVariants(selectedCar?.variants || []);
            setSelectedVariantId('');
            setColours([]);
            setSelectedColourId('');
        } else {
            setVariants([]);
            setSelectedVariantId('');
            setColours([]);
            setSelectedColourId('');
        }
    }, [selectedCarId]);

    // When variant is selected — populate colours
    useEffect(() => {
        if (selectedVariantId) {
            const selectedVariant = variants.find(v => v.id === Number(selectedVariantId));
            setColours(selectedVariant?.availableColours || []);
            setSelectedColourId('');
        } else {
            setColours([]);
            setSelectedColourId('');
        }
    }, [selectedVariantId]);

    const fetchDealers = async () => {
        try {
            const res = await api.get('/admin/dealers');
            setDealers(res.data);
        } catch {
            setFormError('Failed to load dealers.');
        }
    };

    const fetchCars = async () => {
        try {
            const res = await getAllCars();
            setCars(res.data);
        } catch {
            setFormError('Failed to load cars.');
        }
    };

    const fetchInventory = async (dealerId) => {
        setInventoryLoading(true);
        try {
            const res = await getInventoryByDealerId(dealerId);
            setInventory(res.data);
        } catch {
            setInventory([]);
        } finally {
            setInventoryLoading(false);
        }
    };

    const handleDealerChange = (e) => {
        const id = e.target.value;
        const dealer = dealers.find(d => d.id === Number(id));
        setSelectedDealerId(id);
        setSelectedDealerName(dealer?.name || '');
        setFormError('');
        setFormSuccess('');
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setFormLoading(true);

        try {
            await addStock({
                dealerId: Number(selectedDealerId),
                variantId: Number(selectedVariantId),
                colourId: Number(selectedColourId),
                quantity: Number(quantity)
            });

            setFormSuccess(`Successfully added ${quantity} unit(s) to ${selectedDealerName}.`);
            setSelectedCarId('');
            setSelectedVariantId('');
            setSelectedColourId('');
            setQuantity('');

            // Refresh inventory table
            fetchInventory(selectedDealerId);

        } catch (err) {
            setFormError(err.response?.data || 'Failed to add stock.');
        } finally {
            setFormLoading(false);
        }
    };

    // Stock badge color logic
    const getStockBadge = (available) => {
        if (available === 0) return 'stock-badge stock-zero';
        if (available <= 2) return 'stock-badge stock-low';
        return 'stock-badge stock-good';
    };

    return (
        <AdminLayout>
            <div className="inventory-page">

                {/* Header */}
                <div className="page-header">
                    <h1>Inventory Management</h1>
                    <p>Add stock to dealers and monitor inventory levels.</p>
                </div>

                {/* Top Section — Form + Dealer Info */}
                <div className="inventory-top-section">

                    {/* Add Stock Form */}
                    <div className="section-card">
                        <h3 className="section-title">Add Stock to Dealer</h3>
                        <form onSubmit={handleAddStock} className="inline-form">

                            {/* Dealer Dropdown */}
                            <div className="form-group">
                                <label>Select Dealer *</label>
                                <select
                                    value={selectedDealerId}
                                    onChange={handleDealerChange}
                                    required
                                >
                                    <option value="">-- Select a dealer --</option>
                                    {dealers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.dealerCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Car Dropdown */}
                            <div className="form-group">
                                <label>Select Car *</label>
                                <select
                                    value={selectedCarId}
                                    onChange={(e) => setSelectedCarId(e.target.value)}
                                    disabled={!selectedDealerId}
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

                            {/* Variant Dropdown */}
                            <div className="form-group">
                                <label>Select Variant *</label>
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
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

                            {/* Colour Dropdown */}
                            <div className="form-group">
                                <label>Select Colour *</label>
                                <select
                                    value={selectedColourId}
                                    onChange={(e) => setSelectedColourId(e.target.value)}
                                    disabled={!selectedVariantId}
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

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity *</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="e.g. 5"
                                    min="1"
                                    required
                                />
                            </div>

                            {formError && <div className="alert alert-error">{formError}</div>}
                            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Adding...' : '+ Add Stock'}
                            </button>

                        </form>
                    </div>

                    {/* Selected Dealer Info */}
                    <div className="section-card">
                        <h3 className="section-title">Selected Dealer</h3>
                        {selectedDealerName ? (
                            <div className="dealer-info-box">
                                <span className="dealer-info-name">{selectedDealerName}</span>
                                <span className="dealer-info-sub">
                                    {inventory.length} inventory row(s) currently
                                </span>
                            </div>
                        ) : (
                            <div className="empty-state">No dealer selected yet.</div>
                        )}
                    </div>

                </div>

                {/* Inventory Table */}
                {selectedDealerId && (
                    <div className="table-wrapper">
                        <div className="table-header">
                            <h3>
                                Inventory — {selectedDealerName}
                            </h3>
                            <button
                                className="btn-secondary-outline"
                                onClick={() => fetchInventory(selectedDealerId)}
                            >
                                Refresh
                            </button>
                        </div>

                        {inventoryLoading ? (
                            <div className="loading-state">Loading inventory...</div>
                        ) : inventory.length === 0 ? (
                            <div className="empty-state">No stock found for this dealer.</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Variant</th>
                                        <th>Colour</th>
                                        <th>Total Stock</th>
                                        <th>Reserved</th>
                                        <th>Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.variant?.variantName}</td>
                                            <td>
                                                <div className="colour-cell">
                                                    <div
                                                        className="colour-swatch"
                                                        style={{
                                                            background: item.colour?.colourCode?.startsWith('#')
                                                                ? item.colour.colourCode
                                                                : '#ccc'
                                                        }}
                                                    />
                                                    {item.colour?.colourName}
                                                </div>
                                            </td>
                                            <td>{item.stockQuantity}</td>
                                            <td>{item.reservedQuantity}</td>
                                            <td>
                                                <span className={getStockBadge(item.stockQuantity - item.reservedQuantity)}>
                                                    {item.stockQuantity - item.reservedQuantity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default InventoryManagement;