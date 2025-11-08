import api from './api';

export function getProfile() {
  const token = localStorage.getItem('token');
  return api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function updateProfile(data) {
  const token = localStorage.getItem('token');
  return api.put('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function changePassword(data) {
  const token = localStorage.getItem('token');
  return api.put('/auth/change-password', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}