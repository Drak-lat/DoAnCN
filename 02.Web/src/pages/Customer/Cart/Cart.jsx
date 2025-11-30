/* filepath: d:\DACN06\DoAnCN\02.Web\src\pages\Customer\Cart\Cart.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../../services/cartService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCartData();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCart();
      
      if (response.success) {
        setCartData(response.data);
        // Mặc định chọn tất cả items
        const itemIds = new Set(response.data.cart.CartDetails?.map(item => item.id_cartdetail) || []);
        setSelectedItems(itemIds);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartDetailId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => new Set(prev.add(cartDetailId)));
      setError('');
      
      const response = await updateCartItem(cartDetailId, newQuantity);
      
      if (response.success) {
        // Cập nhật local state
        setCartData(prev => ({
          ...prev,
          cart: {
            ...prev.cart,
            CartDetails: prev.cart.CartDetails.map(item =>
              item.id_cartdetail === cartDetailId
                ? { ...item, quantitycart_detail: newQuantity }
                : item
            )
          }
        }));
        
        setMessage({ type: 'success', text: 'Đã cập nhật số lượng sản phẩm' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể cập nhật số lượng' });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartDetailId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartDetailId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }
    
    try {
      setError('');
      const response = await removeFromCart(cartDetailId);
      
      if (response.success) {
        // Xóa khỏi local state
        setCartData(prev => ({
          ...prev,
          cart: {
            ...prev.cart,
            CartDetails: prev.cart.CartDetails.filter(item => item.id_cartdetail !== cartDetailId)
          }
        }));
        
        // Xóa khỏi selected items
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartDetailId);
          return newSet;
        });
        
        setMessage({ type: 'success', text: 'Đã xóa sản phẩm khỏi giỏ hàng' });
        
        // Cập nhật cart count trong header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể xóa sản phẩm' });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }
    
    try {
      setError('');
      const response = await clearCart();
      
      if (response.success) {
        setCartData(prev => ({
          ...prev,
          cart: { ...prev.cart, CartDetails: [] }
        }));
        setSelectedItems(new Set());
        setMessage({ type: 'success', text: 'Đã xóa toàn bộ giỏ hàng' });
        
        // Cập nhật cart count trong header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể xóa giỏ hàng' });
    }
  };

  const handleSelectItem = (cartDetailId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartDetailId)) {
        newSet.delete(cartDetailId);
      } else {
        newSet.add(cartDetailId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allItemIds = cartData.cart.CartDetails.map(item => item.id_cartdetail);
    if (selectedItems.size === allItemIds.length) {
      // Bỏ chọn tất cả
      setSelectedItems(new Set());
    } else {
      // Chọn tất cả
      setSelectedItems(new Set(allItemIds));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán' });
      return;
    }
    
    const selectedCartItems = cartData.cart.CartDetails.filter(item => 
      selectedItems.has(item.id_cartdetail)
    );
    
    // Tính tổng tiền của items được chọn
    const total = selectedCartItems.reduce((sum, item) => 
      sum + (item.Product.price * item.quantitycart_detail), 0
    );
    
    // Chuẩn bị data cho checkout
    const checkoutData = {
      type: 'cart',
      cartItems: selectedCartItems.map(item => ({
        id_cartdetail: item.id_cartdetail,
        id_product: item.Product.id_product,
        name: item.Product.name_product,
        author: item.Product.author,
        image_url: getImageUrl(item.Product.image_product),
        quantity: item.quantitycart_detail,
        price: item.Product.price,
        Product: item.Product // Giữ lại để tương thích
      })),
      cartItemIds: Array.from(selectedItems),
      total: total
    };
    
    // Navigate đến trang checkout
    navigate('/checkout', { state: checkoutData });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-page">
          <div className="container">
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải giỏ hàng...</p>
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
        <div className="cart-page">
          <div className="container">
            <div className="error-container">
              <h2>Có lỗi xảy ra</h2>
              <p>{error}</p>
              <button onClick={fetchCartData} className="btn-retry">
                Thử lại
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const cartItems = cartData?.cart?.CartDetails || [];
  const isEmpty = cartItems.length === 0;

  // Tính tổng tiền của items được chọn
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id_cartdetail));
  const selectedTotal = selectedCartItems.reduce((sum, item) => 
    sum + (item.Product.price * item.quantitycart_detail), 0
  );

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="container">

          {/* Success/Error Message */}
          {message.text && (
            <div className={`cart-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          {isEmpty ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Giỏ hàng của bạn đang trống</h2>
              <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <button 
                onClick={() => navigate('/')} 
                className="btn-continue-shopping"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-main">
                {/* Cart Controls */}
                <div className="cart-controls">
                  <div className="select-all">
                    {/* ✅ SỬA: Dùng checkbox đơn giản hơn */}
                    <input
                      type="checkbox"
                      id="select-all"
                      className="cart-checkbox"
                      checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="select-all-label">
                      Chọn tất cả ({cartItems.length} sản phẩm)
                    </label>
                  </div>
                  
                  <button 
                    onClick={handleClearCart} 
                    className="btn-clear-cart"
                    disabled={cartItems.length === 0}
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Cart Items */}
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item.id_cartdetail} className="cart-item">
                      <div className="item-select">
                        {/* ✅ SỬA: Dùng checkbox đơn giản */}
                        <input
                          type="checkbox"
                          id={`item-${item.id_cartdetail}`}
                          className="cart-checkbox"
                          checked={selectedItems.has(item.id_cartdetail)}
                          onChange={() => handleSelectItem(item.id_cartdetail)}
                        />
                      </div>

                      <div className="item-image">
                        <img 
                          src={getImageUrl(item.Product.image_product)}
                          alt={item.Product.name_product}
                          onError={(e) => e.target.src = '/placeholder-book.jpg'}
                        />
                      </div>

                      <div className="item-info">
                        <h3 className="item-name">{item.Product.name_product}</h3>
                        {item.Product.author && (
                          <p className="item-author">Tác giả: {item.Product.author}</p>
                        )}
                        {item.Product.publisher && (
                          <p className="item-publisher">NXB: {item.Product.publisher}</p>
                        )}
                        <p className="item-stock">Còn lại: {item.Product.quantity} sản phẩm</p>
                      </div>

                      <div className="item-price">
                        <span className="price">{formatPrice(item.Product.price)}</span>
                      </div>

                      <div className="item-quantity">
                        <div className="quantity-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id_cartdetail, item.quantitycart_detail - 1)}
                            disabled={item.quantitycart_detail <= 1 || updatingItems.has(item.id_cartdetail)}
                          >
                            −
                          </button>
                          <span className="qty-display">
                            {updatingItems.has(item.id_cartdetail) ? '...' : item.quantitycart_detail}
                          </span>
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id_cartdetail, item.quantitycart_detail + 1)}
                            disabled={item.quantitycart_detail >= item.Product.quantity || updatingItems.has(item.id_cartdetail)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="item-total">
                        <span className="total-price">
                          {formatPrice(item.Product.price * item.quantitycart_detail)}
                        </span>
                      </div>

                      <div className="item-actions">
                        <button 
                          onClick={() => handleRemoveItem(item.id_cartdetail)}
                          className="btn-remove"
                          title="Xóa sản phẩm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-content">
                  <h3>Tổng đơn hàng</h3>
                  
                  <div className="summary-row">
                    <span>Đã chọn:</span>
                    <span>{selectedItems.size} sản phẩm</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(selectedTotal)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  
                  <div className="summary-total">
                    <span>Tổng cộng:</span>
                    <span className="total-amount">{formatPrice(selectedTotal)}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="btn-checkout"
                    disabled={selectedItems.size === 0}
                  >
                    Thanh toán ({selectedItems.size} sản phẩm)
                  </button>

                  <button 
                    onClick={() => navigate('/')}
                    className="btn-continue-shopping-summary"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;