import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const navigate = useNavigate();

    const handleContactClick = () => {
        navigate('/contact');
    };

    return (
        <footer className="footer">
            <div className="promo-banner">
                <img src="/app.jpg" alt="Promo Banner" />
                <div className="app-download">
                    <h2>Tải Ứng Dụng HAVANABOOK Ngay!</h2>
                    <p>Tải app về để dùng tiện hơn</p>
                    <div className="store-buttons">
                        <img src="/googleplay.png" alt="Google Play" />
                        <img src="/appstore.png" alt="App Store" />
                    </div>
                </div>
            </div>

            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-logo">
                        <h2>HAVANABOOK</h2>
                    </div>

                    <div className="footer-columns">
                        <div className="footer-col">
                            <h4>Về chúng tôi</h4>
                            <ul>
                                <li><Link to="/about">Giới thiệu</Link></li>
                                <li><Link to="/blog">Bài viết</Link></li>
                                <li><Link to="/careers">Tuyển dụng</Link></li>
                                <li><Link to="/terms">Điều khoản dịch vụ</Link></li>
                                <li><Link to="/donate">Ủng hộ</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Khám phá</h4>
                            <ul>
                                <li><Link to="/">Trang chủ</Link></li>
                                <li><Link to="/products">Sách</Link></li>
                                <li><Link to="/authors">Tác giả</Link></li>
                                <li><Link to="/categories">Chủ đề</Link></li>
                                <li><Link to="/search">Tìm kiếm nâng cao</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Tài khoản của tôi</h4>
                            <ul>
                                <li><Link to="/login">Đăng nhập</Link></li>
                                <li><Link to="/cart">Xem giỏ hàng</Link></li>
                                <li><Link to="/wishlist">Danh sách yêu thích</Link></li>
                                <li><Link to="/orders">Theo dõi đơn hàng</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Trợ giúp</h4>
                            <ul>
                                <li><Link to="/help">Trung tâm trợ giúp</Link></li>
                                <li><Link to="/report">Báo cáo vấn đề</Link></li>
                                <li><Link to="/feedback">Đóng góp ý kiến</Link></li>
                                <li><Link to="/contact">Liên hệ với chúng tôi</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-contact">
                    <span 
                        onClick={handleContactClick}
                        className="contact-clickable"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleContactClick();
                            }
                        }}
                    >
                        📞 Đừng Ngần Ngại Liên Hệ Với Chúng Tôi Khi Cần!
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;