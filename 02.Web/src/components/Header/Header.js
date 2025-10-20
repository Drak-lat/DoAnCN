// ...existing code...
import React from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingCart, faSearch, faGift, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserFromToken } from '../../utils/auth';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate('/')}>
          HAVANABOOK
        </div>

        <div className="header-center">
          <div className="header-category">
            <FontAwesomeIcon icon={faGift} />
            <FontAwesomeIcon icon={faCaretDown} className="caret" />
          </div>
          <form className="header-search" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Tìm kiếm..." />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>

        <div className="header-actions">
          <FontAwesomeIcon
            icon={faShoppingCart}
            className="action-icon"
            onClick={() => navigate('/cart')}
          />
          <FontAwesomeIcon
            icon={faUser}
            className="action-icon"
            onClick={() => {
              if (isAuthenticated()) {
                const user = getUserFromToken();
                if (user?.id_level === 1) navigate('/admin');
                else navigate('/customer');
              } else {
                navigate('/login');
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
// ...existing code...