import api from './api';

// ADMIN — Get all customers (with optional search)
export const getAllCustomers = (search = '') => {
    const url = search
        ? `/admin/customers?search=${encodeURIComponent(search)}`
        : '/admin/customers';
    return api.get(url);
};

// ADMIN — Get single customer by ID
export const getCustomerById = (id) => api.get(`/admin/customers/${id}`);

// DEALER — Search customer by phone (auto-fill in booking form)
export const searchCustomerByPhone = (phone) =>
    api.get(`/dealer/customers/search?phone=${encodeURIComponent(phone)}`);

// DEALER — Search customer by name
export const searchCustomerByName = (name) =>
    api.get(`/dealer/customers/search?name=${encodeURIComponent(name)}`);