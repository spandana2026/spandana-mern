import { api } from './api.js';
export const settingsService = {
  getPublic:  ()     => api.get('/settings'),
  getDraft:   ()     => api.get('/admin/settings/draft', true),
  getStatus:  ()     => api.get('/admin/settings/status', true),
  saveDraft:  (data) => api.put('/admin/settings', data, true),
  publish:    ()     => api.post('/admin/settings/publish', {}, true),
};
