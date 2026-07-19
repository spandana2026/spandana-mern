import { api } from './api.js';
export const shopService = {
  getProducts:   (p=1,l=20) => api.get(`/shop/products?page=${p}&limit=${l}`),
  createProduct: (data)     => api.post('/admin/shop/products', data, true),
  updateProduct: (id,data)  => api.put(`/admin/shop/products/${id}`, data, true),
  deleteProduct: (id)       => api.delete(`/admin/shop/products/${id}`, true),
  getOrders:     (p=1,l=20) => api.get(`/admin/shop/orders?page=${p}&limit=${l}`, true),
};
