import api from './api';

// Lấy dữ liệu trang chủ
export const getHomeData = async (params = {}) => {
  try {
    console.log('🔄 Starting getHomeData with params:', params);
    
    const queryParams = new URLSearchParams(params).toString();
    const url = `/customer/home${queryParams ? `?${queryParams}` : ''}`;
    console.log('🚀 Calling API:', url);
    
    const response = await api.get(url);
    console.log('✅ API Response received:', {
      success: response.data.success,
      totalProducts: response.data.data?.totalProducts,
      productsCount: response.data.data?.products?.length,
      featuredCount: response.data.data?.featuredProducts?.length,
      newCount: response.data.data?.newProducts?.length
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ getHomeData error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Chi tiết lỗi cho người dùng
    if (error.code === 'ECONNREFUSED') {
      throw { message: 'Không thể kết nối với server. Server có thể chưa khởi động.' };
    } else if (error.response?.status >= 500) {
      throw { message: 'Lỗi server nội bộ. Vui lòng thử lại sau.' };
    } else if (error.response?.status === 404) {
      throw { message: 'API endpoint không tồn tại.' };
    }
    
    throw error.response?.data || { message: error.message || 'Lỗi không xác định' };
  }
};

// Lấy chi tiết sản phẩm
export const getProductDetail = async (productId) => {
  try {
    const response = await api.get(`/customer/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('❌ getProductDetail error:', error);
    throw error.response?.data || { message: 'Lỗi kết nối' };
  }
};

// Format giá tiền
export const formatPrice = (price) => {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Format đường dẫn ảnh
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-book.jpg';
  
  // Nếu đã là URL đầy đủ
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/uploads/products/${imagePath}`;
};