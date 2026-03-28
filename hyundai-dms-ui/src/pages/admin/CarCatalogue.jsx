import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllCars,
  createCar,
  addVariant,
  getAllColours,
  assignColourToVariant
} from '../../services/carService';
import './CarCatalogue.css';

const CarCatalogue = () => {
  const [cars, setCars] = useState([]);
  const [colours, setColours] = useState([]);
  const [expandedCarId, setExpandedCarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Car form
  const [carForm, setCarForm] = useState({ modelName: '' });
  const [carFormError, setCarFormError] = useState('');
  const [carFormLoading, setCarFormLoading] = useState(false);

  // Variant form — one per car
  const [variantForms, setVariantForms] = useState({});
  const [variantFormErrors, setVariantFormErrors] = useState({});

  // Assign colour form — one per variant
  const [assignForms, setAssignForms] = useState({});
  const [assignMode, setAssignMode] = useState({}); // 'existing' or 'new'
  const [assignErrors, setAssignErrors] = useState({});
  const [assignSuccess, setAssignSuccess] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [carsRes, coloursRes] = await Promise.all([getAllCars(), getAllColours()]);
      setCars(carsRes.data);
      setColours(coloursRes.data);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Car ---
  const handleCarFormChange = (e) => {
    setCarForm({ modelName: e.target.value });
    setCarFormError('');
  };

  const handleCreateCar = async (e) => {
    e.preventDefault();
    setCarFormLoading(true);
    setCarFormError('');
    try {
      await createCar(carForm);
      setCarForm({ modelName: '' });
      fetchAll();
    } catch (err) {
      setCarFormError(err.response?.data || 'Failed to create car.');
    } finally {
      setCarFormLoading(false);
    }
  };

  // --- Expand ---
  const toggleExpand = (carId) => {
    setExpandedCarId(expandedCarId === carId ? null : carId);
  };

  // --- Variant ---
  const getVariantForm = (carId) => variantForms[carId] || { variantName: '', price: '' };

  const handleVariantFormChange = (carId, field, value) => {
    setVariantForms(prev => ({
      ...prev,
      [carId]: { ...getVariantForm(carId), [field]: value }
    }));
    setVariantFormErrors(prev => ({ ...prev, [carId]: '' }));
  };

  const handleAddVariant = async (e, carId) => {
    e.preventDefault();
    const form = getVariantForm(carId);
    try {
      await addVariant(carId, { variantName: form.variantName, price: Number(form.price) });
      setVariantForms(prev => ({ ...prev, [carId]: { variantName: '', price: '' } }));
      fetchAll();
    } catch (err) {
      setVariantFormErrors(prev => ({
        ...prev,
        [carId]: err.response?.data || 'Failed to add variant.'
      }));
    }
  };

  // --- Assign Colour ---
  const getAssignForm = (variantId) => assignForms[variantId] || {
    selectedColourId: '',
    colourName: '',
    colourCode: '',
    pickedColour: '#5B2D8E'
  };

  const getAssignMode = (variantId) => assignMode[variantId] || 'existing';

  const handleAssignModeChange = (variantId, mode) => {
    setAssignMode(prev => ({ ...prev, [variantId]: mode }));
    setAssignErrors(prev => ({ ...prev, [variantId]: '' }));
    setAssignSuccess(prev => ({ ...prev, [variantId]: '' }));
  };

  const handleAssignFormChange = (variantId, field, value) => {
    setAssignForms(prev => ({
      ...prev,
      [variantId]: { ...getAssignForm(variantId), [field]: value }
    }));
    setAssignErrors(prev => ({ ...prev, [variantId]: '' }));
    setAssignSuccess(prev => ({ ...prev, [variantId]: '' }));
  };

  const handleAssignColour = async (e, variantId) => {
    e.preventDefault();
    const form = getAssignForm(variantId);
    const mode = getAssignMode(variantId);

    let payload = {};

    if (mode === 'existing') {
      const selected = colours.find(c => c.id === Number(form.selectedColourId));
      if (!selected) {
        setAssignErrors(prev => ({ ...prev, [variantId]: 'Please select a colour.' }));
        return;
      }
      payload = { colourName: selected.colourName, colourCode: selected.colourCode };
    } else {
      payload = { colourName: form.colourName, colourCode: form.colourCode };
    }

    try {
      const res = await assignColourToVariant(variantId, payload);
      const msg = res.data.warning || 'Colour assigned successfully.';
      setAssignSuccess(prev => ({ ...prev, [variantId]: msg }));
      setAssignForms(prev => ({
        ...prev,
        [variantId]: { selectedColourId: '', colourName: '', colourCode: '', pickedColour: '#5B2D8E' }
      }));
      fetchAll();
    } catch (err) {
      setAssignErrors(prev => ({
        ...prev,
        [variantId]: err.response?.data || 'Failed to assign colour.'
      }));
    }
  };

  return (
    <AdminLayout>
      <div className="car-catalogue-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Car Catalogue</h1>
            <p>Manage all car models, variants and colours.</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="catalogue-layout">

          {/* Left: Cars */}
          <div className="cars-section">

            {/* Add Car Form */}
            <div className="section-card">
              <h3 className="section-title">Add New Car Model</h3>
              <form onSubmit={handleCreateCar} className="inline-form">
                <div className="form-group">
                  <label>Model Name *</label>
                  <input
                    value={carForm.modelName}
                    onChange={handleCarFormChange}
                    placeholder="e.g. Creta, Verna, Alcazar"
                    required
                  />
                </div>
                {carFormError && <div className="alert alert-error">{carFormError}</div>}
                <button type="submit" className="btn-primary" disabled={carFormLoading}>
                  {carFormLoading ? 'Adding...' : '+ Add Car'}
                </button>
              </form>
            </div>

            {/* Car List */}
            <div className="section-card">
              <h3 className="section-title">Car Models ({cars.length})</h3>

              {loading ? (
                <div className="loading-state">Loading cars...</div>
              ) : cars.length === 0 ? (
                <div className="empty-state">No car models added yet.</div>
              ) : (
                <div className="car-list">
                  {cars.map(car => (
                    <div key={car.id} className="car-item">

                      {/* Car Row */}
                      <div
                        className={`car-row ${expandedCarId === car.id ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(car.id)}
                      >
                        <div className="car-row-left">
                          <span className="car-expand-arrow">
                            {expandedCarId === car.id ? '▾' : '▸'}
                          </span>
                          <span className="car-model-name">{car.modelName}</span>
                          <span className="variant-count">
                            {car.variants?.length || 0} variant{car.variants?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedCarId === car.id && (
                        <div className="car-expanded-content">

                          {/* Variants List */}
                          {car.variants && car.variants.length > 0 ? (
                            <div className="variants-list">
                              {car.variants.map(variant => (
                                <div key={variant.id} className="variant-item">
                                  <div className="variant-header">
                                    <div className="variant-info">
                                      <span className="variant-name">{variant.variantName}</span>
                                      <span className="variant-price">
                                        ₹{Number(variant.price).toLocaleString('en-IN')}
                                      </span>
                                    </div>

                                    {/* Colours */}
                                    <div className="colour-chips">
                                      {variant.availableColours && variant.availableColours.length > 0 ? (
                                        variant.availableColours.map(colour => (
                                          <span key={colour.id} className="colour-chip">
                                            <span
                                              className="colour-swatch"
                                              style={{ background: colour.colourCode.startsWith('#') ? colour.colourCode : '#ccc' }}
                                            />
                                            {colour.colourName}
                                            <span className="colour-code-tag">{colour.colourCode}</span>
                                          </span>
                                        ))
                                      ) : (
                                        <span className="no-colours">No colours assigned</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Assign Colour Form */}
                                  <div className="assign-colour-form">
                                    <p className="assign-title">Assign Colour to this Variant</p>

                                    <div className="assign-mode-tabs">
                                      <button
                                        type="button"
                                        className={`mode-tab ${getAssignMode(variant.id) === 'existing' ? 'active' : ''}`}
                                        onClick={() => handleAssignModeChange(variant.id, 'existing')}
                                      >
                                        Select Existing
                                      </button>
                                      <button
                                        type="button"
                                        className={`mode-tab ${getAssignMode(variant.id) === 'new' ? 'active' : ''}`}
                                        onClick={() => handleAssignModeChange(variant.id, 'new')}
                                      >
                                        Add New
                                      </button>
                                    </div>

                                    <form onSubmit={(e) => handleAssignColour(e, variant.id)} className="assign-form-inner">
                                      {getAssignMode(variant.id) === 'existing' ? (
                                        <div className="form-group">
                                          <label>Select Colour</label>
                                          <select
                                            value={getAssignForm(variant.id).selectedColourId}
                                            onChange={(e) => handleAssignFormChange(variant.id, 'selectedColourId', e.target.value)}
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
                                      ) : (
                                        <div className="new-colour-fields">
                                          <div className="form-group">
                                            <label>Colour Name *</label>
                                            <input
                                              value={getAssignForm(variant.id).colourName}
                                              onChange={(e) => handleAssignFormChange(variant.id, 'colourName', e.target.value)}
                                              placeholder="e.g. Abyss Black"
                                              required
                                            />
                                          </div>
                                          <div className="form-group">
                                            <label>Colour Code</label>
                                            <div className="colour-input-row">
                                              <input
                                                type="color"
                                                value={getAssignForm(variant.id).pickedColour}
                                                onChange={(e) => {
                                                  handleAssignFormChange(variant.id, 'pickedColour', e.target.value);
                                                  handleAssignFormChange(variant.id, 'colourCode', e.target.value); // auto-fill the code
                                                }}
                                                className="colour-picker"
                                                title="Pick a colour for reference"
                                              />
                                              <input
                                                value={getAssignForm(variant.id).colourCode}
                                                onChange={(e) => handleAssignFormChange(variant.id, 'colourCode', e.target.value)}
                                                placeholder="e.g. #1A2B3C or RBP (editable)"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {assignErrors[variant.id] && (
                                        <div className="alert alert-error">{assignErrors[variant.id]}</div>
                                      )}
                                      {assignSuccess[variant.id] && (
                                        <div className="alert alert-success">{assignSuccess[variant.id]}</div>
                                      )}

                                      <button type="submit" className="btn-sm btn-primary-sm">
                                        Assign Colour
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state-sm">No variants added yet.</div>
                          )}

                          {/* Add Variant Form */}
                          <div className="add-variant-form">
                            <p className="assign-title">Add Variant to {car.modelName}</p>
                            <form onSubmit={(e) => handleAddVariant(e, car.id)} className="assign-form-inner">
                              <div className="new-colour-fields">
                                <div className="form-group">
                                  <label>Variant Name *</label>
                                  <input
                                    value={getVariantForm(car.id).variantName}
                                    onChange={(e) => handleVariantFormChange(car.id, 'variantName', e.target.value)}
                                    placeholder="e.g. 1.5L Petrol SX"
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Price (₹) *</label>
                                  <input
                                    type="number"
                                    value={getVariantForm(car.id).price}
                                    onChange={(e) => handleVariantFormChange(car.id, 'price', e.target.value)}
                                    placeholder="e.g. 1200000"
                                    required
                                    min="0"
                                  />
                                </div>
                              </div>
                              {variantFormErrors[car.id] && (
                                <div className="alert alert-error">{variantFormErrors[car.id]}</div>
                              )}
                              <button type="submit" className="btn-sm btn-primary-sm">
                                + Add Variant
                              </button>
                            </form>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default CarCatalogue;