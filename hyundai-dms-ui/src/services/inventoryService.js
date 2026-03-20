import api from './api';

// ADMIN — Add stock to a dealer
export const addStock = (data) => api.post('/admin/inventory/add', data);

// ADMIN — Get inventory of any dealer by dealerId
export const getInventoryByDealerId = (dealerId) => api.get(`/admin/inventory/${dealerId}`);

// DEALER — Get own inventory (no params needed, backend reads from token)
export const getMyInventory = () => api.get('/dealer/inventory');