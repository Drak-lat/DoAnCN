import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==================== CUSTOMER ====================

// Customer: Lấy tất cả tin nhắn với admin
export const getMyMessages = async () => {
  try {
    const response = await api.get('/customer/messages', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMyMessages error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Customer: Gửi tin nhắn cho admin
export const sendMessageToAdmin = async (content) => {
  try {
    const response = await api.post('/customer/messages', 
      { content },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('❌ sendMessageToAdmin error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// ==================== ADMIN ====================

// Admin: Lấy danh sách khách hàng đã nhắn tin
export const getCustomersWithMessages = async () => {
  try {
    const response = await api.get('/admin/messages/customers', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getCustomersWithMessages error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Admin: Lấy tin nhắn với 1 customer
export const getMessagesWithCustomer = async (customerId) => {
  try {
    const response = await api.get(`/admin/messages/customers/${customerId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMessagesWithCustomer error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Admin: Gửi tin nhắn cho customer
export const sendMessageToCustomer = async (customerId, content) => {
  try {
    const response = await api.post(`/admin/messages/customers/${customerId}`,
      { content },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('❌ sendMessageToCustomer error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};