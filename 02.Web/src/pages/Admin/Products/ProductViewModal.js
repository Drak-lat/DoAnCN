import React from 'react';
import './ProductModal.css';

function ProductViewModal({ product, onClose }) {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết sản phẩm</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="product-view-grid">
            {/* Thông tin cơ bản */}
            <div className="product-view-section">
              <h3>Thông tin cơ bản</h3>
              <div className="product-view-item">
                <label>Tên sản phẩm:</label>
                <span>{product.name_product}</span>
              </div>
              <div className="product-view-item">
                <label>Danh mục:</label>
                <span>{product.Category?.name_category || 'Chưa phân loại'}</span>
              </div>
              <div className="product-view-item">
                <label>Giá:</label>
                <span className="price-highlight">{formatPrice(product.price)}</span>
              </div>
              <div className="product-view-item">
                <label>Số lượng:</label>
                <span>{product.quantity}</span>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="product-view-section">
              <h3>Thông tin chi tiết</h3>
              {product.author && (
                <div className="product-view-item">
                  <label>Tác giả:</label>
                  <span>{product.author}</span>
                </div>
              )}
              {product.publisher && (
                <div className="product-view-item">
                  <label>Nhà xuất bản:</label>
                  <span>{product.publisher}</span>
                </div>
              )}
              {product.publisher_year && (
                <div className="product-view-item">
                  <label>Năm xuất bản:</label>
                  <span>{product.publisher_year}</span>
                </div>
              )}
              {product.page && (
                <div className="product-view-item">
                  <label>Số trang:</label>
                  <span>{product.page}</span>
                </div>
              )}
              {product.dimension && (
                <div className="product-view-item">
                  <label>Kích thước:</label>
                  <span>{product.dimension}</span>
                </div>
              )}
              {product.manufacturer && (
                <div className="product-view-item">
                  <label>Nhà sản xuất:</label>
                  <span>{product.manufacturer}</span>
                </div>
              )}
            </div>

            {/* Hình ảnh */}
            {product.image_product && (
              <div className="product-view-section">
                <h3>Hình ảnh</h3>
                <img 
                  src={`http://localhost:3000/uploads/products/${product.image_product}`}
                  alt={product.name_product}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}

            {/* Mô tả */}
            {product.text_product && (
              <div className="product-view-section">
                <h3>Mô tả</h3>
                <p style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '4px',
                  lineHeight: '1.6'
                }}>
                  {product.text_product}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductViewModal;