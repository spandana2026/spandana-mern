import { api } from './api.js';
export const teamService = {
  listAdmin: () => api.get('/admin/team', true),
  create:    (data)     => api.post('/admin/team', data, true),
  update:    (id,data)  => api.put(`/admin/team/${id}`, data, true),
  delete:    (id)       => api.delete(`/admin/team/${id}`, true),
};
