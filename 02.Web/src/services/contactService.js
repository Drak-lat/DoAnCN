import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAllContacts(params = {}) {
  return api.get('/admin/contacts', { params, headers: authHeader() });
}

export function getContactById(id) {
  return api.get(`/admin/contacts/${id}`, { headers: authHeader() });
}

export function deleteContact(id) {
  return api.delete(`/admin/contacts/${id}`, { headers: authHeader() });
}

export function getContactStatistics() {
  return api.get('/admin/contacts/statistics', { headers: authHeader() });
}

// API công khai cho khách hàng - SỬA ENDPOINT
export function createContact(contactData) {
  return api.post('/customer/contact', contactData);
}