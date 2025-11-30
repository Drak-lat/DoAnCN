import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getProductsByCategory } from '../../../services/headerCustomerService';
import { formatPrice, getImageUrl } from '../../../services/homeService';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryName = searchParams.get('name') || 'Danh mục';

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getProductsByCategory(categoryId, {
          page: searchParams.get('page') || 1,
          limit: 12,
          sort: sortBy
        });
        
        if (response.success) {
          setProducts(response.data.products);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error('Category products error:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchParams, sortBy]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="category-page">
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
        <div className="category-page">
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
      <div className="category-page">
        <div className="container">
          <div className="category-header">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumb-link">Trang chủ</span>
              <span className="breadcrumb-separator"> › </span>
              <span className="breadcrumb-current">{categoryName}</span>
            </div>
            
            {pagination && (
              <p className="category-info">
                {pagination.totalProducts} sản phẩm
              </p>
            )}
          </div>

          {/* Sort options */}
          <div className="category-controls">
            <div className="sort-options">
              <label>Sắp xếp theo:</label>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <h3>Chưa có sản phẩm nào trong danh mục này</h3>
              <p>Vui lòng quay lại sau hoặc xem các danh mục khác.</p>
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

export default CategoryProducts;