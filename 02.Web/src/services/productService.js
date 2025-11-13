import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAllProducts(params = {}) {
  return api.get('/admin/products', { params, headers: authHeader() });
}

export function getProductById(id) {
  return api.get(`/admin/products/${id}`, { headers: authHeader() });
}

export function getCategories() {
  return api.get('/admin/categories', { headers: authHeader() });
}

export function createProduct(formData) {
  return api.post('/admin/products', formData, {
    headers: {
      ...authHeader()
    }
  });
}

export function updateProduct(id, formData) {
  return api.put(`/admin/products/${id}`, formData, {
    headers: { ...authHeader() }
  });
}

export function deleteProduct(id) {
  return api.delete(`/admin/products/${id}`, { headers: authHeader() });
}