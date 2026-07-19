import { api } from './api.js';
export const galleryService = {
  getAll:    (p=1,l=20) => api.get(`/gallery?page=${p}&limit=${l}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/gallery?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/gallery', data, true),
  update:    (id,data)  => api.put(`/admin/gallery/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/gallery/${id}`, true),
};
