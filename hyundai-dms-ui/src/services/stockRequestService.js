import api from './api';

// DEALER
export const createStockRequest = (data) => api.post('/dealer/stock-requests', data);
export const getMyStockRequests = () => api.get('/dealer/stock-requests');
export const getMyInvoices = () => api.get('/dealer/invoices');

// ADMIN
export const getAllStockRequests = () => api.get('/admin/stock-requests');
export const approveStockRequest = (id) => api.put(`/admin/stock-requests/${id}/approve`);
export const rejectStockRequest = (id) => api.put(`/admin/stock-requests/${id}/reject`);
export const dispatchStockRequest = (id) => api.put(`/admin/stock-requests/${id}/dispatch`);
export const getAllInvoices = () => api.get('/admin/invoices');