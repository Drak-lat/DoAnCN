/* filepath: d:\DACN06\DoAnCN\02.Web\src\pages\Customer\Checkout\Checkout.jsx */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { formatPrice, getImageUrl } from '../../../services/homeService';
// ✅ SỬA: Import từ service đúng
import { createDirectOrder, createOrderFromCart } from '../../../services/orderCustomerService';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutData = location.state;

  const [orderData, setOrderData] = useState({
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    payment_method: 'COD',
    note: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kiểm tra xem có dữ liệu checkout không
    if (!checkoutData) {
      navigate('/cart'); // ✅ SỬA: Đúng route
      return;
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
    
    // Validation
    if (!orderData.receiver_name.trim()) {
      setError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!orderData.receiver_phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!orderData.receiver_address.trim()) {
      setError('Vui lòng nhập địa chỉ nhận hàng');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(orderData.receiver_phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let response;

      if (checkoutData.type === 'direct') {
        // Mua ngay từ ProductDetail
        const orderPayload = {
          ...orderData,
          items: checkoutData.items,
          total: checkoutData.total
        };
        response = await createDirectOrder(orderPayload);
      } else if (checkoutData.type === 'cart') {
        // Mua từ giỏ hàng
        const orderPayload = {
          ...orderData,
          cart_item_ids: checkoutData.cartItemIds || [],
          total: checkoutData.total
        };
        response = await createOrderFromCart(orderPayload);
      }
      
      if (response?.success) {
        // Cập nhật cart count nếu mua từ giỏ hàng
        if (checkoutData.type === 'cart') {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
        
        navigate('/checkout/success', {
          state: {
            orderId: response.data.id_order,
            total: response.data.total,
            orderStatus: response.data.order_status, // ✅ Đã là "Chờ xác nhận"
          }
        });
      } else {
        setError(response?.message || 'Đã có lỗi xảy ra khi đặt hàng');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="container">
            <div className="error-message">
              Không tìm thấy thông tin đặt hàng. Vui lòng quay lại giỏ hàng.
            </div>
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="checkout-content">
            <div className="checkout-main">
              {/* Order Summary */}
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
                    <span style={{color: '#28a745'}}>Miễn phí</span>
                  </div>
                  
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(checkoutData.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Form */}
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
                      placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)"
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
                      <option value="BANK">Chuyển khoản ngân hàng</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={orderData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú cho đơn hàng (thời gian giao hàng mong muốn, yêu cầu đặc biệt...)"
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
                          <span style={{marginRight: '8px'}}>⏳</span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span style={{marginRight: '8px'}}>🛒</span>
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