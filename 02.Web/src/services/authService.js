import api from './api';

export function register(data) {
  return api.post('/customer/register', data);
}

export function login(data) {
  return api.post('/auth/login', data);
}

// ✅ THÊM
export function forgotPassword(data) {
  return api.post('/auth/forgot-password', data);
}