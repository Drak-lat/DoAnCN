import React from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingCart, faSearch, faGift, faCaretDown } from '@fortawesome/free-solid-svg-icons';

function Header() {
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

        {/* Cart + User */}
        <div className="header-actions">
          <FontAwesomeIcon icon={faShoppingCart} className="action-icon" />
          <FontAwesomeIcon icon={faUser} className="action-icon" />
        </div>
      </div>
    </header>
  );
}

export default Header;