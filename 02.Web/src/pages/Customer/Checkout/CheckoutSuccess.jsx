/* filepath: d:\DACN06\DoAnCN\02.Web\src\pages\Customer\Checkout\CheckoutSuccess.jsx */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { formatPrice } from '../../../services/homeService';
import './CheckoutSuccess.css';


import { useMemo } from 'react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy orderData từ state hoặc từ query string (dành cho redirect từ PayPal)
  const orderData = useMemo(() => {
    if (location.state) return location.state;
    // Parse query string
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const total = params.get('total');
    const orderStatus = params.get('orderStatus');
    const status = params.get('status');
    if (status === 'fail') {
      return { fail: true };
    }
    if (orderId && total) {
      return { orderId, total, orderStatus };
    }
    return null;
  }, [location]);

  if (!orderData) {
    return (
      <>
        <Header />
        <div className="success-page">
          <div className="container">
            <div className="success-content">
              <div className="success-icon">
                <div className="checkmark">❌</div>
              </div>
              <h2>Không tìm thấy thông tin đơn hàng</h2>
              <p>Vui lòng thử lại hoặc liên hệ hỗ trợ khách hàng.</p>
              <button onClick={() => navigate('/')} className="btn-home">
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (orderData.fail) {
    return (
      <>
        <Header />
        <div className="success-page">
          <div className="container">
            <div className="success-content">
              <div className="success-icon">
                <div className="checkmark">❌</div>
              </div>
              <h2>Thanh toán thất bại</h2>
              <p>Đơn hàng của bạn chưa được thanh toán thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ khách hàng.</p>
              <button onClick={() => navigate('/')} className="btn-home">
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="success-page">
        <div className="container">
          <div className="success-content">
            <div className="success-icon">
              <div className="checkmark">✓</div>
            </div>

            <h1>Đặt hàng thành công!</h1>
            <p className="success-message">
              Cảm ơn bạn đã đặt hàng tại <strong>HavanaBook</strong>.
              Chúng tôi sẽ liên hệ với bạn trong vòng <strong>24 giờ</strong> để xác nhận đơn hàng.
            </p>

            <div className="order-info">
              <div className="info-row">
                <span className="label">Mã đơn hàng:</span>
                <span className="value">#{orderData.orderId}</span>
              </div>
              <div className="info-row">
                <span className="label">Tổng tiền:</span>
                <span className="value price">{formatPrice(orderData.total)}</span>
              </div>
              <div className="info-row">
                <span className="label">Trạng thái:</span>
                <span className="value status">
                  {orderData.orderStatus || 'Chờ xác nhận'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">📞 Hỗ trợ:</span> {/* ✅ SỬA: Thêm icon */}
                <span className="value">1900-1234</span>
              </div>
            </div>

            <div className="success-actions">
              <button
                onClick={() => navigate('/customer/orders')}
                className="btn-orders"
              >
                Xem đơn hàng của tôi
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-continue"
              >
                Tiếp tục mua sắm
              </button>
            </div>

            <div className="success-note">
              <p>💡 <strong>Lưu ý:</strong> Vui lòng giữ máy để nhân viên có thể liên hệ xác nhận đơn hàng.</p> {/* ✅ SỬA: Thêm icon */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutSuccess;