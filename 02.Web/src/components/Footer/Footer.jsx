import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="promo-banner">
                <img src="/app.jpg" alt="Promo Banner" />
                <div className="app-download">
                    <h2>Download Our App Now!</h2>
                    <p>Tải app về để dùng tiện hơn</p>
                    <div className="store-buttons">
                        <img src="/googleplay.jpg" alt="Google Play" />
                        <img src="/appstore.jpg" alt="App Store" />
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
                            <h4>About Us</h4>
                            <ul>
                                <li><a href="#">Vision</a></li>
                                <li><a href="#">Articles</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Service Terms</a></li>
                                <li><a href="#">Donate</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Discover</h4>
                            <ul>
                                <li><a href="#">Home</a></li>
                                <li><a href="#">Books</a></li>
                                <li><a href="#">Authors</a></li>
                                <li><a href="#">Subjects</a></li>
                                <li><a href="#">Advanced Search</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>My Account</h4>
                            <ul>
                                <li><a href="#">Sign In</a></li>
                                <li><a href="#">View Cart</a></li>
                                <li><a href="#">My Wishlist</a></li>
                                <li><a href="#">Track My Order</a></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4>Help</h4>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Report a Problem</a></li>
                                <li><a href="#">Suggesting Edits</a></li>
                                <li><a href="#">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-contact">
                    <span>📞 Đừng Ngần Ngại Liên Hệ Với Chúng Tôi Khi Cần!</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
