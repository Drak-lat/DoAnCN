import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getMyOrdersForFeedback, createFeedback } from '../../../services/feedbackService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './CustomerReviews.css';

const CustomerReviews = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrdersForFeedback();
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

  const handleOpenFeedback = (product, orderId) => {
    setSelectedProduct({ ...product, orderId });
    setFeedbackData({ rating: 5, comment: '' });
    setShowModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackData.comment.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await createFeedback({
        id_product: selectedProduct.id_product,
        id_order: selectedProduct.orderId,
        rating: feedbackData.rating,
        comment: feedbackData.comment
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Đánh giá thành công!' });
        setShowModal(false);
        fetchOrders(); // Reload
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể gửi đánh giá' });
    } finally {
      setSubmitting(false);
    }
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
            <div className="customer-profile-loading">Đang tải...</div>
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
            <h1>Nhận xét của tôi</h1>
            <p>Đánh giá sản phẩm đã mua</p>
          </div>

          {message.text && (
            <div className={`customer-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          {/* Menu Navigation */}
          <div className="customer-profile-menu">
            <div className="customer-menu-item" onClick={() => navigate('/customer/profile')}>
              Thông tin cá nhân
            </div>
            <div className="customer-menu-item" onClick={() => navigate('/customer/change-password')}>
              Đổi mật khẩu
            </div>
            <div className="customer-menu-item" onClick={() => navigate('/customer/orders')}>
              Đơn hàng của tôi
            </div>
            <div className="customer-menu-item active">
              Nhận xét của tôi
            </div>
            <div className="customer-menu-item logout" onClick={handleLogout}>
              Đăng xuất
            </div>
          </div>

          {/* Orders List */}
          <div className="customer-profile-content">
            {orders.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon">📦</div>
                <h3>Chưa có đơn hàng nào để đánh giá</h3>
                <p>Hãy mua sắm và đặt hàng ngay!</p>
                <button onClick={() => navigate('/')} className="btn-shopping">
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="reviews-list">
                {orders.map(order => (
                  <div key={order.id_order} className="review-order-card">
                    <div className="review-order-header">
                      <strong>Đơn hàng #{order.id_order}</strong>
                      <span className="order-date">
                        {new Date(order.date_order).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="review-products-list">
                      {order.OrderDetails && order.OrderDetails.map((item, index) => (
                        <div key={index} className="review-product-item">
                          <img
                            src={getImageUrl(item.Product?.image_product)}
                            alt={item.Product?.name_product}
                            onError={(e) => e.target.src = '/placeholder-book.jpg'}
                          />
                          <div className="review-product-info">
                            <h4>{item.Product?.name_product}</h4>
                            <p className="review-product-price">{formatPrice(item.price_detail)}</p>
                          </div>
                          {item.hasFeedback ? (
                            <span className="badge-reviewed">Đã đánh giá</span>
                          ) : (
                            <button
                              onClick={() => handleOpenFeedback(item.Product, order.id_order)}
                              className="btn-review"
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh giá sản phẩm</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="feedback-product">
                <img
                  src={getImageUrl(selectedProduct?.image_product)}
                  alt={selectedProduct?.name_product}
                />
                <h4>{selectedProduct?.name_product}</h4>
              </div>
              <div className="feedback-rating">
                <label>Đánh giá:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= feedbackData.rating ? 'active' : ''}`}
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="feedback-comment">
                <label>Nhận xét của bạn:</label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows="5"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Hủy
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CustomerReviews;