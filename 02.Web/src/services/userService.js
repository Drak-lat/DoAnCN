import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAllUsers(params = {}) {
  return api.get('/admin/users', { params, headers: authHeader() });
}

export function getUserById(id) {
  return api.get(`/admin/users/${id}`, { headers: authHeader() });
}

export function createUser(userData) {
  return api.post('/admin/users', userData, { headers: authHeader() });
}

export function deleteUser(id) {
  return api.delete(`/admin/users/${id}`, { headers: authHeader() });
}

export function restoreUser(id) {
  return api.patch(`/admin/users/${id}/restore`, {}, { headers: authHeader() });
}