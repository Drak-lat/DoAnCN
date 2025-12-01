import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader/AdminHeader';
import { getProductsWithFeedback } from '../../../services/feedbackService';
import { getImageUrl } from '../../../services/homeService';
import './AdminFeedback.css';

function AdminFeedback() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductsWithFeedback({ search });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleViewFeedbacks = (productId) => {
    navigate(`/admin/feedback/${productId}`);
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader title="Quản lý phản hồi" />
          <div className="admin-content">
            <div className="loading">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Quản lý phản hồi" />
        <div className="admin-content">
          <div className="content-header">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-search">Tìm kiếm</button>
            </form>
          </div>

          <div className="feedback-products-grid">
            {products.length === 0 ? (
              <div className="no-data">Không có sản phẩm nào có đánh giá</div>
            ) : (
              products.map(product => (
                <div key={product.id_product} className="feedback-product-card">
                  <img
                    src={getImageUrl(product.image_product)}
                    alt={product.name_product}
                    onError={(e) => e.target.src = '/placeholder-book.jpg'}
                  />
                  <div className="feedback-product-info">
                    <h3>{product.name_product}</h3>
                    <div className="feedback-stats">
                      <span className="rating">⭐ {product.avgRating}</span>
                      <span className="count">{product.feedbackCount} đánh giá</span>
                    </div>
                    <button
                      onClick={() => handleViewFeedbacks(product.id_product)}
                      className="btn-view-feedbacks"
                    >
                      Xem đánh giá
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;