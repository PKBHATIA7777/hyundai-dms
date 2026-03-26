import api from './api';

export const createBooking  = (data) => api.post('/dealer/bookings', data);

export const getMyBookings  = (status) => {
  if (status) return api.get(`/dealer/bookings?status=${status}`);
  return api.get('/dealer/bookings');
};

export const getBookingById = (id) => api.get(`/dealer/bookings/${id}`);

export const cancelBooking  = (id) => api.put(`/dealer/bookings/${id}/cancel`);