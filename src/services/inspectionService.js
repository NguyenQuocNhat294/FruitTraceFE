import { api } from './api';

export const inspectionService = {
    getAll: (params) => api.get('/inspections', { params }),
    create: (data) => api.post('/inspections', data),
    update: (id, data) => api.put(`/inspections/${id}`, data),
    delete: (id) => api.delete(`/inspections/${id}`),
};

