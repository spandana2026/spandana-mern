import { api } from './api.js';
export const cmsService = {
  getSections:  ()     => api.get('/cms-sections'),
  saveSections: (data) => api.put('/admin/cms-sections', data, true),
};
