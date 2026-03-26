import api from './api';

// DEALER
export const getMyEmployees     = () => api.get('/dealer/employees');
export const getMyEmployeeById  = (id) => api.get(`/dealer/employees/${id}`);
export const createMyEmployee   = (data) => api.post('/dealer/employees', data);
export const updateMyEmployee   = (id, data) => api.put(`/dealer/employees/${id}`, data);
export const deactivateMyEmployee = (id) => api.put(`/dealer/employees/${id}/deactivate`);
export const activateMyEmployee   = (id) => api.put(`/dealer/employees/${id}/activate`);

// ADMIN
export const getEmployeesByDealer = (dealerId) =>
  api.get(`/admin/employees?dealerId=${dealerId}`);
export const createEmployeeForDealer = (dealerId, data) =>
  api.post(`/admin/employees?dealerId=${dealerId}`, data);
export const updateEmployee     = (id, data) => api.put(`/admin/employees/${id}`, data);
export const deactivateEmployee = (id) => api.put(`/admin/employees/${id}/deactivate`);