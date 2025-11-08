import api from './api';

export function getDashboard() {
  const token = localStorage.getItem('token');
  return api.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getTopProducts() {
  const token = localStorage.getItem('token');
  return api.get('/admin/top-products', {
    headers: { Authorization: `Bearer ${token}` }
  });
}