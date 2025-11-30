/* filepath: d:\DACN06\DoAnCN\02.Web\src\services\homeService.js */
import api from './api';

export const getHomeData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    // ✅ SỬA: Endpoint đúng
    const url = `/customer/products${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Không thể kết nối với server. Server có thể chưa khởi động.');
    } else if (error.response?.status >= 500) {
      throw new Error('Lỗi server nội bộ. Vui lòng thử lại sau.');
    } else if (error.response?.status === 404) {
      throw new Error('API endpoint không tồn tại.');
    }
    
    throw error.response?.data || new Error(error.message || 'Lỗi không xác định');
  }
};

export const getProductDetail = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // ✅ SỬA: Endpoint đúng
    const response = await api.get(`/customer/products/${productId}`, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    } else if (error.response?.status === 403) {
      throw new Error('Bạn cần đăng nhập với tài khoản khách hàng để xem chi tiết sản phẩm.');
    }
    
    throw error.response?.data || new Error('Lỗi kết nối');
  }
};

export const formatPrice = (price) => {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-book.jpg';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/products/${imagePath}`;
};