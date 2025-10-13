import axios from 'axios';

// Tạo một instance của axios với URL gốc của API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Thay bằng URL của backend
});

export default api;