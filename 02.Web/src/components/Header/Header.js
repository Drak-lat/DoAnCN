import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShoppingCart, 
  faSearch, 
  faGift, 
  faCaretDown,
  faEnvelope 
} from '@fortawesome/free-solid-svg-icons';
import { getCategories } from '../../services/headerCustomerService';
import { getCart } from '../../services/cartService'; // ✅ THÊM

function Header() {
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0); // ✅ THÊM
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('❌ Error loading categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // ✅ THÊM: Fetch cart count khi đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (isLoggedIn) {
        fetchCartCount();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isLoggedIn]);

  // ✅ THÊM: Function để fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await getCart();
      if (response.success) {
        const itemCount = response.data.cart?.CartDetails?.length || 0;
        setCartCount(itemCount);
      }
    } catch (error) {
      console.error('❌ Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryId, categoryName) => {
    setShowDropdown(false);
    navigate(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // ✅ THÊM: Handle cart click
  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart');  // ✅ SỬA từ '/customer/cart' thành '/cart'
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">HAVANABOOK</Link>

        {/* Category + Search */}
        <div className="header-center">
          <div className="header-category" ref={dropdownRef}>
            <div 
              className="category-button"
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={() => setShowDropdown(true)}
            >
              <FontAwesomeIcon icon={faGift} />
              <span></span>
              <FontAwesomeIcon icon={faCaretDown} className="caret" />
            </div>
            
            {showDropdown && (
              <div 
                className="category-dropdown"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div 
                  className="category-item"
                  onClick={() => handleCategorySelect('all', 'Tất cả sản phẩm')}
                >
                </div>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <div
                      key={category.id_category}
                      className="category-item"
                      onClick={() => handleCategorySelect(category.id_category, category.name_category)}
                    >
                      {category.name_category}
                    </div>
                  ))
                ) : (
                  <div className="category-item">Đang tải...</div>
                )}
              </div>
            )}
          </div>
          
          <form className="header-search" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Tìm kiếm sách theo tên, tác giả, thể loại..." 
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>

        {/* Messages + Cart + User */}
        <div className="header-actions">
          <Link to="/messages" style={{ color: 'inherit', textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faEnvelope} className="action-icon" title="Tin nhắn" />
          </Link>
          
          {/* ✅ SỬA: Cart với link và badge */}
          <div className="cart-wrapper" onClick={handleCartClick} style={{ cursor: 'pointer', position: 'relative' }}>
            <FontAwesomeIcon icon={faShoppingCart} className="action-icon" title="Giỏ hàng" />
            {isLoggedIn && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </div>
          
          {isLoggedIn ? (
            <Link to="/customer/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
              <FontAwesomeIcon icon={faUser} className="action-icon" title="Tài khoản" />
            </Link>
          ) : (
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
              <FontAwesomeIcon icon={faUser} className="action-icon" title="Đăng nhập" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;