import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAllOrders(params = {}) {
  return api.get('/admin/orders', { params, headers: authHeader() });
}

export function getOrderById(id) {
  return api.get(`/admin/orders/${id}`, { headers: authHeader() });
}

export function updateOrderStatus(id, statusData) {
  return api.patch(`/admin/orders/${id}/status`, statusData, { headers: authHeader() });
}

export function getOrderStatistics() {
  return api.get('/admin/orders/statistics', { headers: authHeader() });
}