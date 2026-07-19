import { api } from './api.js';
export const valuesService = {
  getAll:    (p=1,l=20) => api.get(`/values?page=${p}&limit=${l}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/values?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/values', data, true),
  update:    (id,data)  => api.put(`/admin/values/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/values/${id}`, true),
};
