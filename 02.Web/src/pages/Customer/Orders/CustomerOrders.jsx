import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getUserOrders } from '../../../services/orderCustomerService';
import { formatPrice } from '../../../services/homeService';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getUserOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Chờ xác nhận': 'warning',
      'Đã xác nhận': 'info',
      'Đang giao': 'primary',
      'Đã giao': 'success',
      'Đã hủy': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  const getPaymentStatusColor = (status) => {
    return status === 'Đã thanh toán' ? 'success' : 'warning';
  };

  const handleOrderClick = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="customer-profile-page">
          <div className="customer-profile-container">
            <div className="customer-profile-loading">Đang tải đơn hàng...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="customer-profile-page">
        <div className="customer-profile-container">
          <div className="customer-profile-header">
            <h1>Đơn hàng của tôi</h1>
            <p>Quản lý và theo dõi đơn hàng của bạn</p>
          </div>

          {error && (
            <div className="customer-message error-message">
              {error}
            </div>
          )}

          {/* Menu Navigation */}
          <div className="customer-profile-menu">
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/profile')}
            >
              Thông tin cá nhân
            </div>
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/change-password')}
            >
              Đổi mật khẩu
            </div>
            <div className="customer-menu-item active">
              Đơn hàng của tôi
            </div>
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/reviews')}
            >
              Nhận xét của tôi
            </div>
            <div 
              className="customer-menu-item logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="orders-filter">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Chờ xác nhận
            </button>
            <button 
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Đã xác nhận
            </button>
            <button 
              className={`filter-btn ${filter === 'shipping' ? 'active' : ''}`}
              onClick={() => setFilter('shipping')}
            >
              Đang giao
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Đã giao
            </button>
            <button 
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Đã hủy
            </button>
          </div>

          {/* Orders List */}
          <div className="customer-profile-content">
            {orders.length === 0 ? (
              <div className="no-orders">
                <div className="no-orders-icon">📦</div>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Hãy mua sắm và đặt hàng ngay!</p>
                <button 
                  onClick={() => navigate('/')}
                  className="btn-shopping"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div 
                    key={order.id_order} 
                    className="order-card"
                    onClick={() => handleOrderClick(order.id_order)}
                  >
                    <div className="order-header">
                      <div className="order-id">
                        <strong>Đơn hàng #{order.id_order}</strong>
                        <span className="order-date">
                          {new Date(order.date_order).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="order-badges">
                        <span className={`badge badge-${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        <span className={`badge badge-${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="order-body">
                      <div className="order-info">
                        <p><strong>Người nhận:</strong> {order.receiver_name}</p>
                        <p><strong>Số điện thoại:</strong> {order.receiver_phone}</p>
                        <p><strong>Địa chỉ:</strong> {order.receiver_address}</p>
                        <p><strong>Thanh toán:</strong> {order.payment_method}</p>
                      </div>
                      
                      {order.OrderDetails && order.OrderDetails.length > 0 && (
                        <div className="order-products">
                          <p className="products-count">
                            {order.OrderDetails.length} sản phẩm
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <span>Tổng tiền:</span>
                        <strong className="total-amount">{formatPrice(order.total)}</strong>
                      </div>
                      <button className="btn-view-detail">
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerOrders;