import { api } from './api.js';
export const programsService = {
  getAll:    (p=1,l=20) => api.get(`/programs?page=${p}&limit=${l}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/programs?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/programs', data, true),
  update:    (id,data)  => api.put(`/admin/programs/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/programs/${id}`, true),
};
