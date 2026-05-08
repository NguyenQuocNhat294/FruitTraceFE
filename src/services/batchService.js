import { api } from './api';

export const batchService = {
    getAll: (params) => api.get('/batches', { params }),
    getById: (id) => api.get(`/batches/${id}`),
    getByCode: (code) => api.get(`/batches/code/${code}`),  // ← tra cứu QR
    create: (data) => api.post('/batches', data),
    update: (id, data) => api.put(`/batches/${id}`, data),
    delete: (id) => api.delete(`/batches/${id}`),
};