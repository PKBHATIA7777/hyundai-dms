import api from './api';

// Create a new lead
export const createLead = (data) => api.post('/dealer/leads', data);

// Get all leads (optional status filter)
export const getMyLeads = (status) => {
    if (status) {
        return api.get(`/dealer/leads?status=${status}`);
    }
    return api.get('/dealer/leads');
};

// Update lead status
export const updateLeadStatus = (leadId, status) =>
    api.put(`/dealer/leads/${leadId}/status`, { status });