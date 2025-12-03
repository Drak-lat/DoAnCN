/* filepath: d:\DACN06\DoAnCN\02.Web\src\pages\Customer\Checkout\Checkout.jsx */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { formatPrice, getImageUrl } from '../../../services/homeService';
// Import các service cần thiết
import { createDirectOrder, createOrderFromCart, createVnpayPayment } from '../../../services/orderCustomerService';
import api from '../../../services/api';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutData = location.state;

  // State lưu thông tin đơn hàng
  const [orderData, setOrderData] = useState({
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    payment_method: 'COD', // Mặc định là COD
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect nếu không có data checkout
  useEffect(() => {
    if (!checkoutData) {
      navigate('/cart');
    }
  }, [checkoutData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- BƯỚC 1: VALIDATION (KIỂM TRA DỮ LIỆU) ---
    if (!orderData.receiver_name.trim()) {
      setError('Vui lòng nhập tên người nhận');
      setLoading(false); return;
    }
    if (!orderData.receiver_phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      setLoading(false); return;
    }
    if (!orderData.receiver_address.trim()) {
      setError('Vui lòng nhập địa chỉ nhận hàng');
      setLoading(false); return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(orderData.receiver_phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (10-11 số)');
      setLoading(false); return;
    }

    try {
      // --- BƯỚC 2: TẠO ĐƠN HÀNG TRONG DATABASE TRƯỚC ---
      // Mục đích: Để có được ID đơn hàng (orderId) gửi cho cổng thanh toán

      console.log("Đang tạo đơn hàng với phương thức:", orderData.payment_method);

      let createOrderResponse;

      // Chuẩn bị dữ liệu gửi lên Server
      const orderPayload = {
        ...orderData,
        total: checkoutData.total,
        // Nếu là COD thì trạng thái là "Chưa thanh toán"
        // Nếu là PayPal/VNPAY thì trạng thái là "Chờ thanh toán" (Pending)
        payment_status: orderData.payment_method === 'COD' ? 'Chưa thanh toán' : 'Chờ thanh toán'
      };

      // Gọi API tạo đơn (tuỳ thuộc mua ngay hay mua từ giỏ hàng)
      if (checkoutData.type === 'direct') {
        orderPayload.items = checkoutData.items;
        createOrderResponse = await createDirectOrder(orderPayload);
      } else if (checkoutData.type === 'cart') {
        orderPayload.cart_item_ids = checkoutData.cartItemIds || [];
        createOrderResponse = await createOrderFromCart(orderPayload);
      }

      // Kiểm tra kết quả tạo đơn
      if (!createOrderResponse || !createOrderResponse.success) {
        throw new Error(createOrderResponse?.message || 'Không thể tạo đơn hàng');
      }

      const newOrderId = createOrderResponse.data.id_order; // ✅ LẤY ĐƯỢC ID ĐƠN HÀNG
      console.log("✅ Đã tạo đơn hàng thành công. Order ID:", newOrderId);

      // Cập nhật lại giỏ hàng (nếu mua từ giỏ)
      if (checkoutData.type === 'cart') {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }

      // --- BƯỚC 3: XỬ LÝ THANH TOÁN (REDIRECT) ---

      // === TRƯỜNG HỢP A: PAYPAL ===
      if (orderData.payment_method === 'PAYPAL') {
        console.log("🔄 Đang gọi API lấy link PayPal...");
        // Gọi API backend, truyền kèm orderId
        const paypalRes = await api.get(`/customer/create_paypal`, {
          params: {
            amount: checkoutData.total,
            orderId: newOrderId // <--- Quan trọng: Gửi ID để PayPal trả về sau khi xong
          }
        });

        if (paypalRes?.data?.paymentUrl) {
          console.log("🔗 Redirect sang PayPal:", paypalRes.data.paymentUrl);
          window.location.href = paypalRes.data.paymentUrl; // Chuyển trang
          return; // Dừng hàm tại đây
        } else {
          throw new Error('Không tạo được link thanh toán PayPal');
        }
      }

      // === TRƯỜNG HỢP B: VNPAY ===
      else if (orderData.payment_method === 'VNPAY') {
        console.log("🔄 Đang gọi API lấy link VNPAY...");
        const vnpayRes = await createVnpayPayment(checkoutData.total, newOrderId); // Truyền thêm OrderID nếu service hỗ trợ

        if (vnpayRes?.paymentUrl) {
          console.log("🔗 Redirect sang VNPAY:", vnpayRes.paymentUrl);
          window.location.href = vnpayRes.paymentUrl;
          return;
        } else {
          throw new Error('Không tạo được link thanh toán VNPAY');
        }
      }

      // === TRƯỜNG HỢP C: COD (Thanh toán khi nhận hàng) ===
      else {
        console.log("📦 Đơn hàng COD hoàn tất.");
        navigate('/checkout/success', {
          state: {
            orderId: newOrderId,
            total: createOrderResponse.data.total,
            orderStatus: createOrderResponse.data.order_status,
          }
        });
      }

    } catch (err) {
      console.error('Checkout Error:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi đặt hàng');
      setLoading(false); // Chỉ tắt loading khi có lỗi, nếu thành công thì đang redirect
    }
  };

  if (!checkoutData) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="container">
            <div className="error-message">Không tìm thấy thông tin đặt hàng.</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const items = checkoutData.type === 'direct' ? checkoutData.items : checkoutData.cartItems;

  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Thanh toán đơn hàng</h1>
            <p>Vui lòng kiểm tra thông tin và hoàn tất đơn hàng</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="checkout-content">
            <div className="checkout-main">
              {/* --- Phần 1: Tóm tắt đơn hàng --- */}
              <div className="order-summary">
                <h2>Đơn hàng của bạn ({items.length} sản phẩm)</h2>
                <div className="order-items">
                  {items.map((item, index) => (
                    <div key={item.id_product || index} className="order-item">
                      <div className="item-image">
                        <img
                          src={getImageUrl(item.image_url || item.Product?.image_product)}
                          alt={item.name || item.Product?.name_product}
                          onError={(e) => e.target.src = '/placeholder-book.jpg'}
                        />
                      </div>
                      <div className="item-details">
                        <h3>{item.name || item.Product?.name_product}</h3>
                        {(item.author || item.Product?.author) && (
                          <p>Tác giả: {item.author || item.Product?.author}</p>
                        )}
                        <p className="item-price">
                          {formatPrice(item.price || item.Product?.price)} x {item.quantity}
                        </p>
                        <p><strong>{formatPrice((item.price || item.Product?.price) * item.quantity)}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(checkoutData.total)}</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span style={{ color: '#28a745' }}>Miễn phí</span>
                  </div>
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(checkoutData.total)}</span>
                  </div>
                </div>
              </div>

              {/* --- Phần 2: Form thông tin --- */}
              <div className="delivery-form">
                <h2>Thông tin giao hàng</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên người nhận *</label>
                      <input
                        type="text"
                        name="receiver_name"
                        value={orderData.receiver_name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên người nhận"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="receiver_phone"
                        value={orderData.receiver_phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại (10-11 số)"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Địa chỉ nhận hàng *</label>
                    <textarea
                      name="receiver_address"
                      value={orderData.receiver_address}
                      onChange={handleInputChange}
                      placeholder="Nhập địa chỉ chi tiết"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phương thức thanh toán</label>
                    <select
                      name="payment_method"
                      value={orderData.payment_method}
                      onChange={handleInputChange}
                    >
                      <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                      <option value="PAYPAL">PayPal (Ví điện tử quốc tế)</option>
                      <option value="VNPAY">VNPAY (Ngân hàng/QR Code)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={orderData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú cho đơn hàng..."
                      rows="2"
                    />
                  </div>

                  <div className="checkout-actions">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="btn-back-checkout"
                      disabled={loading}
                    >
                      ← Quay lại
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-place-order"
                    >
                      {loading ? (
                        <>
                          <span style={{ marginRight: '8px' }}>⏳</span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span style={{ marginRight: '8px' }}>🛒</span>
                          Đặt hàng ngay
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;