import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { searchProducts } from '../../../services/headerCustomerService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance'); // ✅ Đổi từ filters thành sortBy

  useEffect(() => {
    if (!searchQuery.trim()) {
      navigate('/');
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          q: searchQuery,
          page: searchParams.get('page') || 1,
          limit: 12,
          sort: sortBy // ✅ Sử dụng sortBy trực tiếp
        };

        const response = await searchProducts(params);
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, searchParams, sortBy, navigate]); // ✅ Đổi filters thành sortBy

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort); // ✅ Đơn giản hóa
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="search-page">
          <div className="container">
            <div className="loading">Đang tải...</div>
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
        <div className="search-page">
          <div className="container">
            <div className="error">{error}</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="search-page">
        <div className="container">
          {/* ✅ Header giống CategoryProducts */}
          <div className="search-header">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
              <span className="breadcrumb-separator"> › </span>
              <span className="breadcrumb-current">Kết quả tìm kiếm: "{searchQuery}"</span>
            </div>
            
            {pagination && (
              <p className="search-info">
                {pagination.totalProducts} sản phẩm
              </p>
            )}
          </div>

          {/* ✅ Sort options giống CategoryProducts */}
          <div className="search-controls">
            <div className="sort-options">
              <label>Sắp xếp theo:</label>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* ✅ No products giống CategoryProducts */}
          {products.length === 0 ? (
            <div className="no-products">
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p>Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div 
                  key={product.id_product} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id_product)}
                >
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product.image_product)} 
                      alt={product.name_product}
                      onError={(e) => e.target.src = '/placeholder-book.jpg'}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name_product}</h3>
                    {product.author && (
                      <p className="product-author">Tác giả: {product.author}</p>
                    )}
                    {product.publisher && (
                      <p className="product-publisher">NXB: {product.publisher}</p>
                    )}
                    <p className="product-price">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Pagination giống CategoryProducts */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;