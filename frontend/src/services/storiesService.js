import { api } from './api.js';
export const storiesService = {
  getAll:    (p=1,l=20) => api.get(`/stories?page=${p}&limit=${l}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/stories?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/stories', data, true),
  update:    (id,data)  => api.put(`/admin/stories/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/stories/${id}`, true),
};
