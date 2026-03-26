import api from './api';

// ── ADMIN ──
export const getAdminStats = () => api.get('/admin/dashboard/stats');
export const getDealerPerformance = () => api.get('/admin/dashboard/dealer-performance');
export const getAdminMonthlyRevenue = () => api.get('/admin/dashboard/monthly-revenue');
export const getAdminRecentSales = (limit = 10) =>
  api.get(`/admin/dashboard/recent-sales?limit=${limit}`);

// ── DEALER ──
export const getDealerStats = () => api.get('/dealer/dashboard/stats');
export const getDealerMonthlyRevenue = () => api.get('/dealer/dashboard/monthly-revenue');
export const getDealerRecentSales = (limit = 5) =>
  api.get(`/dealer/dashboard/recent-sales?limit=${limit}`);