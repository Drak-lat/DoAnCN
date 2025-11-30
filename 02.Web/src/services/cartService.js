/* filepath: d:\DACN06\DoAnCN\02.Web\src\services\cartService.js */
import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Lấy giỏ hàng của user
export const getCart = async () => {
  try {
    const response = await api.get('/customer/cart', { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ getCart error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Thêm sản phẩm vào giỏ hàng - endpoint đúng
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/customer/cart', {
      id_product: productId,
      quantity: quantity
    }, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ addToCart error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Cập nhật số lượng sản phẩm trong giỏ hàng - endpoint đúng
export const updateCartItem = async (cartDetailId, quantity) => {
  try {
    const response = await api.put(`/customer/cart/${cartDetailId}`, {
      quantity: quantity
    }, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ updateCartItem error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Xóa sản phẩm khỏi giỏ hàng - endpoint đúng
export const removeFromCart = async (cartDetailId) => {
  try {
    const response = await api.delete(`/customer/cart/${cartDetailId}`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error('❌ removeFromCart error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ SỬA: Xóa toàn bộ giỏ hàng - endpoint đúng
export const clearCart = async () => {
  try {
    const response = await api.delete('/customer/cart', { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error('❌ clearCart error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ✅ THÊM: Lấy số lượng sản phẩm trong giỏ hàng
export const getCartCount = async () => {
  try {
    const response = await api.get('/customer/cart/count', { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ getCartCount error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};