/* filepath: d:\DACN06\DoAnCN\02.Web\src\services\headerCustomerService.js */
import api from './api';

// Lấy danh sách categories
export const getCategories = async () => {
  try {
    const response = await api.get('/customer/categories');
    return response.data;
  } catch (error) {
    console.error('❌ getCategories error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Lấy sản phẩm theo danh mục - endpoint đúng
export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/customer/categories/${categoryId}/products${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ getProductsByCategory error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Tìm kiếm sản phẩm - endpoint đúng  
export const searchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/customer/products/search${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ searchProducts error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};