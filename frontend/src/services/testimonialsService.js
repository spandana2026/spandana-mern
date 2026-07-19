import { api } from './api.js';
export const testimonialsService = {
  getAll:    (p=1,l=20) => api.get(`/testimonials?page=${p}&limit=${l}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/testimonials?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/testimonials', data, true),
  update:    (id,data)  => api.put(`/admin/testimonials/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/testimonials/${id}`, true),
};
