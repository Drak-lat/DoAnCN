import api from './api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ SỬA: Thêm authHeader vào request
export const getAvailableAdmins = async () => {
  try {
    const response = await api.get('/customer/admins', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getAvailableAdmins error:', error.response?.data || error);
    throw error.response?.data || { message: 'Lỗi khi lấy danh sách admin' };
  }
};

// ✅ SỬA: Thêm authHeader vào request
export const getMyMessages = async (adminId = null) => {
  try {
    const url = adminId ? `/customer/messages?adminId=${adminId}` : '/customer/messages';
    const response = await api.get(url, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMyMessages error:', error.response?.data || error);
    throw error.response?.data || { message: 'Lỗi khi lấy tin nhắn' };
  }
};

// ✅ SỬA: Thêm authHeader vào request
export const sendMessageToAdmin = async (content, adminId) => {
  try {
    const response = await api.post('/customer/messages', 
      { content, adminId },
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('❌ sendMessageToAdmin error:', error.response?.data || error);
    throw error.response?.data || { message: 'Lỗi khi gửi tin nhắn' };
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