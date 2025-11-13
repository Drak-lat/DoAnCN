import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getHomeData, formatPrice, getImageUrl } from '../../../services/homeService';
import './Home.css';

const Home = () => {
  // ✅ SỬA: State theo structure của bạn nhưng tương thích với design
  const [homeData, setHomeData] = useState({
    products: [],
    featuredProducts: [],
    newProducts: [],
    bestSellerProducts: [],
    totalProducts: 0,
    pagination: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ SỬA: Lấy products từ homeData thay vì trực tiếp
  const products = homeData.products || [];
  
  // ✅ SỬA: heroProduct từ featuredProducts[0] thay vì random
  const heroProduct = homeData.featuredProducts?.[0] || null;
  
  // ✅ SỬA: bestSellerProducts từ API
  const bestSellerProducts = homeData.bestSellerProducts?.slice(0, 4) || products.slice(0, 4);

  // Carousel logic giữ nguyên
  const itemsPerPage = 8;
  const totalSlides = Math.ceil(products.length / itemsPerPage);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  const visibleDotIndex = currentSlide % 5;

  // ✅ SỬA: Fetch data từ homeService
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: '50', // Lấy nhiều sản phẩm để có đủ cho carousel
        page: '1',
        sort: 'newest'
      };

      console.log('🚀 Fetching home data...');
      const response = await getHomeData(params);
      
      if (response.success) {
        setHomeData(response.data);
      } else {
        setError('Không thể tải dữ liệu');
      }
    } catch (err) {
      console.error('❌ Fetch home data error:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // ✅ THÊM: Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Early returns giữ nguyên
  if (loading) return <p className="loading">Đang tải sản phẩm...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <Header />
      <div className="home-container">
        {/* ✅ SỬA: Hero section sử dụng text_product từ database */}
        {heroProduct && (
          <section className="hero-inline">
            <div className="hero-inline-text">
              <h1 className="hero-title">{heroProduct.name_product}</h1>
              <p className="hero-desc">
                {heroProduct.text_product || 
                 "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu feugiat amet, libero ipsum enim pharetra hac. Tristique cursus sed nisl libero ut blandit massa."}
              </p>
              <div className="hero-meta">
                <p className="hero-author">Tác giả: {heroProduct.author || 'Chưa rõ'}</p>
                <p className="hero-price">{formatPrice(heroProduct.price)}</p>
              </div>
            </div>
            <div className="hero-inline-img">
              <img
                src={getImageUrl(heroProduct.image_product)}
                alt={heroProduct.name_product}
                onError={(e) => e.target.src = '/placeholder-book.jpg'}
              />
            </div>
          </section>
        )}

        {/* ✅ BEST SELLER - giữ nguyên design */}
        <section className="bestseller-section">
          <h2 className="section-title">Best Seller</h2>
          <div className="bestseller-list">
            {bestSellerProducts.map((product) => (
              <div 
                className="bestseller-card" 
                key={product.id_product}
                onClick={() => handleProductClick(product.id_product)}
              >
                <img
                  src={getImageUrl(product.image_product)}
                  alt={product.name_product}
                  className="bestseller-img"
                  onError={(e) => e.target.src = '/placeholder-book.jpg'}
                />
                <h3 className="bestseller-name">{product.name_product}</h3>
                <p className="bestseller-author">{product.author || 'Chưa rõ'}</p>
                <p className="bestseller-price">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ DANH SÁCH SẢN PHẨM - giữ nguyên design */}
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
                      <div 
                        className="product-card" 
                        key={product.id_product}
                        onClick={() => handleProductClick(product.id_product)}
                      >
                        <img
                          src={getImageUrl(product.image_product)}
                          alt={product.name_product}
                          className="product-img"
                          onError={(e) => e.target.src = '/placeholder-book.jpg'}
                        />
                        <h3 className="product-name">{product.name_product}</h3>
                        <p className="product-author">{product.author || 'Chưa rõ'}</p>
                        <p className="product-price">{formatPrice(product.price)}</p>
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
                {Array.from({ length: Math.min(5, totalSlides) }).map((_, index) => (
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
      <Footer />
    </>
  );
};

export default Home;