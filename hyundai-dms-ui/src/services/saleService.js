import api from './api';

// Create a new sale from a confirmed booking
export const createSale = (data) => api.post('/dealer/sales', data);

// Get all sales for this dealer
export const getMySales = () => api.get('/dealer/sales');

// Get single sale by ID
export const getSaleById = (id) => api.get(`/dealer/sales/${id}`);

// Get all payments for a specific sale
export const getPaymentsForSale = (id) => api.get(`/dealer/sales/${id}/payments`);

// Get all payments for this dealer
export const getMyPayments = () => api.get('/dealer/payments');