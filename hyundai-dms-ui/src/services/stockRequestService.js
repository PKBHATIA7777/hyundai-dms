import api from './api';

// DEALER
export const createStockRequest = (data) => api.post('/dealer/stock-requests', data);
export const getMyStockRequests = () => api.get('/dealer/stock-requests');
export const getMyInvoices = () => api.get('/dealer/invoices');

// ADMIN
export const getAllStockRequests = () => api.get('/admin/stock-requests');

// ✅ Updated: approveStockRequest now accepts approvedQuantity and sends it in request body
export const approveStockRequest = (id, approvedQuantity) =>
  api.put(`/admin/stock-requests/${id}/approve`, { approvedQuantity });

// ✅ New: Mark request as delivered (triggers inventory update)
export const deliverStockRequest = (id) =>
  api.put(`/admin/stock-requests/${id}/deliver`);

// ✅ New: Reject an already-approved request (voids invoice)
export const rejectApprovedRequest = (id) =>
  api.put(`/admin/stock-requests/${id}/reject-approved`);

// Existing: Reject a PENDING request
export const rejectStockRequest = (id) =>
  api.put(`/admin/stock-requests/${id}/reject`);

// ⚠️ Legacy: dispatch endpoint (consider removing if no longer used)
export const dispatchStockRequest = (id) =>
  api.put(`/admin/stock-requests/${id}/dispatch`);

export const getAllInvoices = () => api.get('/admin/invoices');