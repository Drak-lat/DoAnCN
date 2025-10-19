import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [heroProduct, setHeroProduct] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/customer/products")
            .then((res) => {
                const all = res.data;
                setProducts(all);
                if (all.length > 0) {
                    const randomIndex = Math.floor(Math.random() * all.length);
                    setHeroProduct(all[randomIndex]);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Không thể tải danh sách sản phẩm");
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="loading">Đang tải sản phẩm...</p>;
    if (error) return <p className="error">{error}</p>;

    const bestSellerProducts = products.slice(0, 4);
    const itemsPerPage = 8;
    const totalSlides = Math.ceil(products.length / itemsPerPage);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    const visibleDotIndex = currentSlide % 5;

    return (
        <div className="home-container">
            {/* ==== HERO SẢN PHẨM NỔI BẬT ==== */}
            {heroProduct && (
                <section className="hero-inline">
                    <div className="hero-inline-text">
                        <h1 className="hero-title">{heroProduct.name_product}</h1>
                        <p className="hero-desc">
                            {heroProduct.text_product || "Không có mô tả cho sản phẩm này."}
                        </p>
                    </div>
                    <div className="hero-inline-img">
                        <img
                            src={heroProduct.image_product || "/default-book.png"}
                            alt={heroProduct.name_product}
                        />
                    </div>
                </section>
            )}

            {/* ==== BEST SELLER ==== */}
            <section className="bestseller-section">
                <h2 className="section-title">Best Seller</h2>
                <div className="bestseller-list">
                    {bestSellerProducts.map((product) => (
                        <div className="bestseller-card" key={product.id_product}>
                            <img
                                src={product.image_product || "/default-book.png"}
                                alt={product.name_product}
                                className="bestseller-img"
                            />
                            <h3 className="bestseller-name">{product.name_product}</h3>
                            <p className="bestseller-author">{product.author}</p>
                            <p className="bestseller-price">${product.price}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==== DANH SÁCH SẢN PHẨM ==== */}
            <section className="product-section">
                <h2 className="section-title">Danh Sách Sản Phẩm</h2>
                <div className="carousel">
                    <button className="arrow left" onClick={prevSlide}>
                        &#10094;
                    </button>
                    <div
                        className="carousel-track"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {Array.from({ length: totalSlides }).map((_, i) => {
                            const start = i * itemsPerPage;
                            const pageProducts = products.slice(start, start + itemsPerPage);
                            return (
                                <div className="carousel-slide" key={i}>
                                    {pageProducts.map((product) => (
                                        <div className="product-card" key={product.id_product}>
                                            <img
                                                src={product.image_product || "/default-book.png"}
                                                alt={product.name_product}
                                                className="product-img"
                                            />
                                            <h3 className="product-name">{product.name_product}</h3>
                                            <p className="product-author">{product.author}</p>
                                            <p className="product-price">${product.price}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <button className="arrow right" onClick={nextSlide}>
                        &#10095;
                    </button>
                    {totalSlides > 1 && (
                        <div className="carousel-dots">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`dot ${index === visibleDotIndex ? "active" : ""}`}
                                ></span>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
