import { api } from './api.js';
export const eventsService = {
  getAll:    (p=1,l=20) => api.get(`/events?page=${p}&limit=${l}`),
  getById:   (id)       => api.get(`/events/${id}`),
  listAdmin: (p=1,l=20) => api.get(`/admin/events?page=${p}&limit=${l}`, true),
  create:    (data)     => api.post('/admin/events', data, true),
  update:    (id,data)  => api.put(`/admin/events/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/events/${id}`, true),
};
