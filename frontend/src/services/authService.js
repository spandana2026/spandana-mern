import { api } from './api.js';
export const authService = {
  async adminLogin(password) { const d = await api.post('/auth/admin/login',{password}); if(d.token) localStorage.setItem('spandana_admin_token',d.token); return d; },
  logout() { localStorage.removeItem('spandana_admin_token'); },
  isLoggedIn() { return !!localStorage.getItem('spandana_admin_token'); },
  getToken() { return localStorage.getItem('spandana_admin_token') || ''; },
};
