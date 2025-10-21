import api from './api';
export function register(data) {
  return api.post('/customer/register', data);
}
export function login(data) {
  // data = { identifier, password }
  return api.post('/auth/login', data);
}
export function ForgotPassword(data) {
  return api.post('/auth/forgot-password', data);
}