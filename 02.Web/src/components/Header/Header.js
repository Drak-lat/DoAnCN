import React from 'react';
import { Link } from 'react-router-dom';
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

function Header() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">HAVANABOOK</div>

        {/* Category + Search */}
        <div className="header-center">
          <div className="header-category">
            <FontAwesomeIcon icon={faGift} />
            <FontAwesomeIcon icon={faCaretDown} className="caret" />
          </div>
          <form className="header-search">
            <input type="text" placeholder="Tìm kiếm..." />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>

        {/* Messages + Cart + User */}
        <div className="header-actions">
          {/* Nút tin nhắn - hiện bất cứ lúc nào */}
          <Link to="/messages" style={{ color: 'inherit', textDecoration: 'none' }}>
            <FontAwesomeIcon icon={faEnvelope} className="action-icon" title="Tin nhắn" />
          </Link>
          
          <FontAwesomeIcon icon={faShoppingCart} className="action-icon" title="Giỏ hàng" />
          
          {/* Xử lý icon User theo trạng thái đăng nhập */}
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