import { api } from './api';

export const farmService = {
    getAll: (params) => api.get('/farms', { params }),
    getById: (id) => api.get(`/farms/${id}`),
    create: (data) => api.post('/farms', data),
    update: (id, data) => api.put(`/farms/${id}`, data),
    delete: (id) => api.delete(`/farms/${id}`),
};