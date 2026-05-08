import { api } from './api';

export const traceService = {
    getByBatch: (batchId) => api.get(`/trace/${batchId}`), // ← bỏ /batch/
    getAll:     (params)  => api.get('/trace', { params }),
    create:     (data)    => api.post('/trace', data),
    update:     (id,data) => api.put(`/trace/${id}`, data),
    delete:     (id)      => api.delete(`/trace/${id}`),
};