import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getProductDetail } from '../../../services/homeService';
import { addToCart } from '../../../services/cartService';
import { getProductFeedbacks } from '../../../services/feedbackService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getProductDetail(id);
        
        if (response.success) {
          setProduct(response.data.product);
          setRelatedProducts(response.data.relatedProducts || []);
        }
      } catch (err) {
        if (err.message.includes('đăng nhập')) {
          setError('Bạn cần đăng nhập để xem chi tiết sản phẩm.');
        } else {
          setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load feedbacks khi có product
  useEffect(() => {
    if (product) {
      loadFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const loadFeedbacks = async () => {
    try {
      const response = await getProductFeedbacks(id);
      if (response.success) {
        setFeedbacks(response.data.feedbacks || []);
        setAvgRating(response.data.avgRating || 0);
        setTotalFeedbacks(response.data.totalFeedbacks || 0);
      }
    } catch (error) {
      console.error('Load feedbacks error:', error);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => {
      const newQty = prev + change;
      if (newQty < 1) return 1;
      if (newQty > product?.quantity) return product.quantity;
      return newQty;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setCartLoading(true);
      setMessage({ type: '', text: '' });

      const response = await addToCart(product.id_product, quantity);
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!` 
        });
        
        // Reset quantity về 1
        setQuantity(1);
        
        // Optional: Cập nhật số lượng trong header nếu có
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Không thể thêm sản phẩm vào giỏ hàng' 
      });
    } finally {
      setCartLoading(false);
    }
  };

  // ✅ SỬA: Thay thế CheckoutModal bằng navigate đến trang Checkout
  const handleBuyNow = () => {
    if (!product) return;
    
    // Chuẩn bị data cho trang checkout
    const checkoutData = {
      type: 'direct',
      items: [{
        id_product: product.id_product,
        name: product.name_product,
        author: product.author,
        image_url: getImageUrl(product.image_product),
        quantity: quantity,
        price: product.price
      }],
      total: product.price * quantity
    };
    
    // Navigate đến trang checkout với data
    navigate('/checkout', { state: checkoutData });
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Loading và Error states giữ nguyên...
  if (loading) {
    return (
      <>
        <Header />
        <div className="product-detail-page">
          <div className="container">
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin sản phẩm...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="product-detail-page">
          <div className="container">
            <div className="error-container">
              <div className="error-content">
                <h2>Có lỗi xảy ra</h2>
                <p>{error}</p>
                <button onClick={() => window.history.back()} className="btn-back">
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="product-detail-page">
          <div className="container">
            <div className="error-container">
              <div className="error-content">
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được gỡ bỏ.</p>
                <button onClick={() => navigate('/')} className="btn-back">
                  Về trang chủ
                </button>
              </div>
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
      <div className="product-detail-page">
        <div className="container">
          {/* Success/Error Message */}
          {message.text && (
            <div className={`product-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
            <span className="breadcrumb-separator"> › </span>
            {product.Category && (
              <>
                <span className="breadcrumb-link">{product.Category.name_category}</span>
                <span className="breadcrumb-separator"> › </span>
              </>
            )}
            <span className="breadcrumb-current">{product.name_product}</span>
          </div>

          {/* Product Main Info */}
          <div className="product-main">
            <div className="product-image-section">
              <div className="main-image">
                <img 
                  src={getImageUrl(product.image_product)} 
                  alt={product.name_product}
                  onError={(e) => e.target.src = '/placeholder-book.jpg'}
                />
              </div>
            </div>

            <div className="product-info-section">
              <div className="product-header">
                <h1 className="product-title">{product.name_product}</h1>
                
                {product.author && (
                  <p className="product-author">
                    <span className="author-label">Tác giả:</span>
                    <span className="author-name">{product.author}</span>
                  </p>
                )}
              </div>

              <div className="product-price-section">
                <div className="price-container">
                  <span className="price">{formatPrice(product.price)}</span>
                </div>

                <div className="product-availability">
                  <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>

                {/* Sales Stats */}
                {product.salesStats && product.salesStats.totalSold > 0 && (
                  <div className="sales-stats">
                    <span className="sold-count">Đã bán {product.salesStats.totalSold} sản phẩm</span>
                  </div>
                )}
              </div>

              {product.quantity > 0 && (
                <div className="purchase-section">
                  <div className="quantity-section">
                    <span className="quantity-label">Số lượng:</span>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn" 
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty-display">{quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="product-actions">
                    <button 
                      className="btn-add-cart" 
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                    >
                      {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    </button>
                    <button 
                      className="btn-buy-now" 
                      onClick={handleBuyNow}
                      disabled={cartLoading}
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <div className="details-section">
              <h2>Thông tin chi tiết</h2>
              <div className="details-table">
                {product.publisher && (
                  <div className="detail-row">
                    <span className="detail-label">Nhà xuất bản</span>
                    <span className="detail-value">{product.publisher}</span>
                  </div>
                )}
                {product.publisher_year && (
                  <div className="detail-row">
                    <span className="detail-label">Năm xuất bản</span>
                    <span className="detail-value">{product.publisher_year}</span>
                  </div>
                )}
                {product.page && (
                  <div className="detail-row">
                    <span className="detail-label">Số trang</span>
                    <span className="detail-value">{product.page} trang</span>
                  </div>
                )}
                {product.size && (
                  <div className="detail-row">
                    <span className="detail-label">Kích thước</span>
                    <span className="detail-value">{product.size}</span>
                  </div>
                )}
                {product.dimension && (
                  <div className="detail-row">
                    <span className="detail-label">Kích thước</span>
                    <span className="detail-value">{product.dimension}</span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="detail-row">
                    <span className="detail-label">Nhà sản xuất</span>
                    <span className="detail-value">{product.manufacturer}</span>
                  </div>
                )}
                {product.Category && (
                  <div className="detail-row">
                    <span className="detail-label">Danh mục</span>
                    <span className="detail-value">{product.Category.name_category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            {product.text_product && (
              <div className="description-section">
                <h2>Mô tả sản phẩm</h2>
                <div className="description-content">
                  {product.text_product}
                </div>
              </div>
            )}
          </div>

          {/* ✅ Feedbacks Section - DI CHUYỂN LÊN TRÊN */}
          <div className="product-feedbacks">
            <h2>Đánh giá sản phẩm</h2>
            
            <div className="feedback-summary">
              <div className="avg-rating">
                {renderStars(Math.round(Number(avgRating) || 0))}
                <span className="rating-text">{(Number(avgRating) || 0).toFixed(1)} / 5</span>
              </div>
              <div className="total-feedbacks">
                {totalFeedbacks} đánh giá
              </div>
            </div>

            <div className="feedback-list">
              {feedbacks.length === 0 ? (
                <div className="no-feedbacks">
                  Chưa có đánh giá nào cho sản phẩm này.
                </div>
              ) : (
                feedbacks.map(feedback => (
                  <div key={feedback.id_feedback} className="feedback-item">
                    <div className="feedback-header">
                      <div className="feedback-author">
                        {feedback.Login?.username || feedback.Login?.Information?.name_information || 'Khách hàng'}
                      </div>
                      <div className="feedback-rating">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <div className="feedback-content">
                      {feedback.comment}
                    </div>
                    <div className="feedback-date">
                      {new Date(feedback.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    {feedback.admin_reply && (
                      <div className="admin-reply">
                        <strong>Phản hồi từ Admin:</strong>
                        <p>{feedback.admin_reply}</p>
                        <span className="reply-date">
                          {new Date(feedback.reply_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Related Products - ĐẶT XUỐNG DƯỚI */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2>Sản phẩm liên quan</h2>
              <div className="related-grid">
                {relatedProducts.map(relatedProduct => (
                  <div 
                    key={relatedProduct.id_product} 
                    className="related-card"
                    onClick={() => handleRelatedProductClick(relatedProduct.id_product)}
                  >
                    <div className="related-image">
                      <img 
                        src={getImageUrl(relatedProduct.image_product)} 
                        alt={relatedProduct.name_product}
                        onError={(e) => e.target.src = '/placeholder-book.jpg'}
                      />
                    </div>
                    <div className="related-info">
                      <h3 className="related-title">{relatedProduct.name_product}</h3>
                      {relatedProduct.author && (
                        <p className="related-author">{relatedProduct.author}</p>
                      )}
                      {relatedProduct.publisher && (
                        <p className="related-publisher">{relatedProduct.publisher}</p>
                      )}
                      <p className="related-price">{formatPrice(relatedProduct.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;