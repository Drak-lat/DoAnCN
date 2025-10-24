import axios from 'axios';

// Tạo một instance của axios với URL gốc của API
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Log lỗi để debug
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return Promise.reject(error);
  }
);

export default api;