import { api } from './api.js';
export const blogService = {
  getAll:    (p=1,l=20) => api.get(`/blog?page=${p}&limit=${l}`),
  getById:   (id)       => api.get(`/blog/${id}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/blog?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/blog', data, true),
  update:    (id,data)  => api.put(`/admin/blog/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/blog/${id}`, true),
};
