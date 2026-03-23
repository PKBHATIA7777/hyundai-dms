import api from './api';

// Create a new booking
export const createBooking = (data) => api.post('/dealer/bookings', data);

// Get all bookings (optional status filter)
export const getMyBookings = (status) => {
    if (status) {
        return api.get(`/dealer/bookings?status=${status}`);
    }
    return api.get('/dealer/bookings');
};

// Get single booking by ID
export const getBookingById = (id) => api.get(`/dealer/bookings/${id}`);