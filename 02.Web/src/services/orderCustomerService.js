import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Tạo đơn hàng mới (thanh toán ngay)
export const createDirectOrder = async (orderData) => {
  try {
    const response = await api.post('/customer/orders/create-direct', orderData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ createDirectOrder error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Tạo đơn hàng từ giỏ hàng
export const createOrderFromCart = async (orderData) => {
  try {
    const response = await api.post('/customer/orders/create-from-cart', orderData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ createOrderFromCart error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Lấy danh sách đơn hàng của user
export const getUserOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/customer/orders${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ getUserOrders error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`/customer/orders/${orderId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getOrderDetail error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.patch(`/customer/orders/${orderId}/cancel`, {}, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ cancelOrder error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Xác nhận đơn hàng đã nhận
export const confirmOrderReceived = async (orderId) => {
  try {
    const response = await api.patch(`/customer/orders/${orderId}/confirm-received`, {}, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ confirmOrderReceived error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};