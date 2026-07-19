import { api } from './api.js';
export const newsletterService = {
  subscribe:   (email) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email) => api.post('/newsletter/unsubscribe', { email }),
  listAdmin:   (p=1,l=20) => api.get(`/admin/newsletter?page=${p}&limit=${l}`, true),
};
