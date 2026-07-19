import { api } from './api.js';
export const contactService = {
  submit: (data) => api.post('/contact', data),
};
