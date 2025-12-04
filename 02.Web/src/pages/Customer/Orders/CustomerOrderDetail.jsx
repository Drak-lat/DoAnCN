/* filepath: d:\DACN06\DoAnCN\02.Web\src\pages\Customer\Orders\CustomerOrderDetail.jsx */
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

  // ✅ SỬA 1: Khởi tạo là null (nghĩa là chưa biết thời gian)
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ✅ SỬA 2: Logic đếm ngược
  useEffect(() => {
    // Nếu timeLeft là null (chưa load) hoặc 0 (hết giờ) thì không chạy timer
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timerId);
          return 0; // Đã về 0
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(orderId);

      if (response.success) {
        setOrder(response.data);
        // ✅ SỬA 3: Cập nhật timeLeft từ API
        if (response.data.remainingTimeMs !== undefined) {
          setTimeLeft(response.data.remainingTimeMs);
        } else {
          // Trường hợp API không trả về (phòng hờ), set mặc định
          setTimeLeft(0);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải trang');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 4. Hàm format mili-giây sang HH:mm:ss
  const formatTimer = (ms) => {
    if (!ms) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ✅ 5. Hàm xử lý thanh toán lại (Chuyển hướng sang Backend PayPal Controller)
  const handlePayment = () => {
    // Lưu ý: Cập nhật URL này đúng với port server API của bạn (ví dụ 3000)
    window.location.href = `http://localhost:3000/api/create-payment?orderId=${order.id_order}&amount=${order.total}&platform=web`;
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

              {/* ✅ SỬA 4: Điều kiện hiển thị đếm ngược */}
              {/* Chỉ hiện khi timeLeft khác null VÀ lớn hơn 0 */}
              {order?.payment_status === 'Chưa thanh toán' &&
                order?.order_status !== 'Đã hủy' &&
                timeLeft !== null && timeLeft > 0 && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeeba',
                    borderRadius: '5px',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ fontSize: '24px' }}>⚠️</div>
                    <div>
                      <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                        Đơn hàng sẽ tự động hủy sau: <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{formatTimer(timeLeft)}</span>
                      </strong>
                      <span style={{ fontSize: '14px' }}>
                        Vui lòng thanh toán ngay để tránh bị hủy đơn hàng.
                      </span>
                    </div>
                  </div>
                )}

              {/* ✅ SỬA 5: Điều kiện hiển thị thông báo hết hạn */}
              {/* Chỉ hiện khi timeLeft chính xác là 0 (đã load xong và tính ra 0) */}
              {order?.payment_status === 'Chưa thanh toán' &&
                order?.order_status !== 'Đã hủy' &&
                timeLeft === 0 && (
                  <div style={{ marginTop: '15px', color: '#dc3545', fontWeight: 'bold' }}>
                    Đơn hàng đã hết hạn thanh toán.
                  </div>
                )}

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
            <div className="order-detail-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/customer/orders')}
                className="btn-back"
              >
                ← Quay lại danh sách
              </button>

              {/* ✅ NÚT THANH TOÁN NGAY */}
              {order.payment_status === 'Chưa thanh toán' &&
                order.order_status !== 'Đã hủy' &&
                timeLeft > 0 &&
                order.payment_method === 'PayPal' && ( // Chỉ hiện nếu chọn PayPal
                  <button
                    onClick={handlePayment}
                    className="btn-primary" // Đảm bảo class này có style trong CSS của bạn (ví dụ màu xanh/cam)
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      backgroundColor: '#0070ba',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thanh toán PayPal Ngay
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerOrderDetail;