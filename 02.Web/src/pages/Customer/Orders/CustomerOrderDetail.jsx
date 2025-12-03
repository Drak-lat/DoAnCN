import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getOrderDetail } from '../../../services/orderCustomerService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './CustomerOrders.css';

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getOrderDetail(orderId);

      if (response.success) {
        setOrder(response.data); // ✅ SỬA: Lấy trực tiếp response.data thay vì response.data.order
      }
    } catch (err) {
      console.error('Fetch order detail error:', err);
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
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
    if (status === 'Đã thanh toán') return 'success';
    if (status === 'Chưa thanh toán') return 'danger';
    return 'warning';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="customer-profile-page">
          <div className="customer-profile-container">
            <div className="customer-profile-loading">Đang tải chi tiết đơn hàng...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="customer-profile-page">
          <div className="customer-profile-container">
            <div className="customer-message error-message">
              {error || 'Không tìm thấy đơn hàng'}
            </div>
            <button onClick={() => navigate('/customer/orders')} className="btn-back">
              ← Quay lại danh sách đơn hàng
            </button>
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
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/customer/orders')} className="breadcrumb-link">
              Đơn hàng của tôi
            </span>
            <span className="breadcrumb-separator"> › </span>
            <span className="breadcrumb-current">Chi tiết đơn hàng #{order.id_order}</span>
          </div>

          {/* Order Detail Content */}
          <div className="order-detail-container">
            {/* Order Status */}
            <div className="order-detail-status">
              <h2>Trạng thái đơn hàng</h2>
              <div className="status-badges">
                <span className={`badge badge-${getStatusColor(order.order_status)}`}>
                  {order.order_status}
                </span>
                <span className={`badge badge-${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status}
                </span>
              </div>
              <p className="order-date">
                Ngày đặt: {new Date(order.date_order).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Receiver Info */}
            <div className="order-detail-section">
              <h3>Thông tin người nhận</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Họ tên:</strong>
                  <span>{order.receiver_name}</span>
                </div>
                <div className="info-item">
                  <strong>Số điện thoại:</strong>
                  <span>{order.receiver_phone}</span>
                </div>
                <div className="info-item">
                  <strong>Địa chỉ:</strong>
                  <span>{order.receiver_address}</span>
                </div>
                <div className="info-item">
                  <strong>Phương thức thanh toán:</strong>
                  <span>{order.payment_method}</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="order-detail-section">
              <h3>Sản phẩm đã đặt</h3>
              <div className="order-products-list">
                {order.OrderDetails && order.OrderDetails.map((item, index) => (
                  <div key={index} className="order-product-item">
                    <div className="product-image">
                      <img
                        src={getImageUrl(item.Product?.image_product)}
                        alt={item.Product?.name_product}
                        onError={(e) => e.target.src = '/placeholder-book.jpg'}
                      />
                    </div>
                    <div className="product-info">
                      <h4>{item.Product?.name_product || 'Sản phẩm'}</h4>
                      {item.Product?.author && <p>Tác giả: {item.Product.author}</p>}
                      {item.Product?.publisher && <p>NXB: {item.Product.publisher}</p>}
                    </div>
                    <div className="product-quantity">
                      <span>x{item.quantity_detail}</span>
                    </div>
                    <div className="product-price">
                      <span className="unit-price">{formatPrice(item.price_detail)}</span>
                      <strong className="total-price">
                        {formatPrice(item.price_detail * item.quantity_detail)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-detail-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng:</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="order-detail-actions">
              <button
                onClick={() => navigate('/customer/orders')}
                className="btn-back"
              >
                ← Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerOrderDetail;