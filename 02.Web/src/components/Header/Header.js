import React, { useState, useEffect } from "react";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faSearch,
  faGift,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

function Header() {
  const banners = ["/banner1.webp", "/banner2.jpg"];
  const [currentBanner, setCurrentBanner] = useState(0);

  // 🔄 Tự động đổi banner sau mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <>
      {/* === Banner trên đầu === */}
      <div className="top-banner">
        <img
          src={banners[currentBanner]}
          alt="Banner quảng cáo"
          className="banner-img"
        />
      </div>

      {/* === Header chính === */}
      <header className="main-header">
        <div className="header-container">
          <div className="header-logo">HAVANABOOK</div>

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

          <div className="header-actions">
            <FontAwesomeIcon icon={faShoppingCart} className="action-icon" />
            <FontAwesomeIcon icon={faUser} className="action-icon" />
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
