import api from './api';

export const getAllCars = () => api.get('/admin/cars');
export const createCar = (data) => api.post('/admin/cars', data);
export const addVariant = (carId, data) => api.post(`/admin/cars/${carId}/variants`, data);
export const getAllColours = () => api.get('/admin/colours');
export const addColour = (data) => api.post('/admin/colours', data);
export const assignColourToVariant = (variantId, data) => api.post(`/admin/variants/${variantId}/colours`, data);