import { api } from './api.js';
export const adsService = {
  getAds:  () => api.get('/ads'),
  saveAds: (data) => api.put('/admin/ads', data, true),
};
