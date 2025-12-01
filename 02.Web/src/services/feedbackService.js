import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Lấy feedback của sản phẩm (công khai)
export const getProductFeedbacks = async (productId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/customer/products/${productId}/feedbacks${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ getProductFeedbacks error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Lấy danh sách đơn hàng để feedback
export const getMyOrdersForFeedback = async () => {
  try {
    const response = await api.get('/customer/my-orders-feedback', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMyOrdersForFeedback error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Tạo feedback mới
export const createFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/customer/feedbacks', feedbackData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ createFeedback error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Lấy feedback của tôi
export const getMyFeedbacks = async () => {
  try {
    const response = await api.get('/customer/my-feedbacks', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMyFeedbacks error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ADMIN - Lấy danh sách sản phẩm có feedback
export const getProductsWithFeedback = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/admin/feedbacks/products${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ getProductsWithFeedback error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ADMIN - Lấy feedback của sản phẩm
export const getProductFeedbacksAdmin = async (productId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/admin/feedbacks/products/${productId}${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('❌ getProductFeedbacksAdmin error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ADMIN - Phản hồi feedback
export const replyFeedback = async (feedbackId, replyData) => {
  try {
    const response = await api.patch(`/admin/feedbacks/${feedbackId}/reply`, replyData, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ replyFeedback error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ADMIN - Xóa feedback
export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await api.delete(`/admin/feedbacks/${feedbackId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ deleteFeedback error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};