import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import ProductViewModal from './ProductViewModal';
import { getAllProducts, getCategories, deleteProduct } from '../../../services/productService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faFilter, faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './AdminProducts.css';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: ''
  });
  const [pagination, setPagination] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllProducts(filters);

      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách sản phẩm' });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
      return;
    }

    try {
      const response = await deleteProduct(id);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Xóa sản phẩm thành công' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Delete product error:', error);
      setMessage({ type: 'error', text: 'Không thể xóa sản phẩm' });
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleAdd = () => {
    navigate('/admin/products/add');
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.id_product}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getPageItems = (totalPages, currentPage, maxButtons = 7) => {
    if (!totalPages || totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const siblings = 2;
    const left = Math.max(2, currentPage - siblings);
    const right = Math.min(totalPages - 1, currentPage + siblings);

    pages.push(1);

    if (left > 2) {
      pages.push('left-ellipsis');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('right-ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <AdminLayout>
      <div className="admin-products">
        <div className="products-header">
          <h1>Quản lý sản phẩm</h1>
          <button className="btn-add-product" onClick={handleAdd}>
            <FontAwesomeIcon icon={faPlus} />
            Thêm sản phẩm
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </div>
        )}

        <div className="products-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </form>

          <div className="filter-group">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id_category} value={cat.id_category}>
                  {cat.name_category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product.id_product}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="product-name">{product.name_product}</td>
                      <td>{product.Category?.name_category || 'N/A'}</td>
                      <td className="product-price">{formatPrice(product.price)}</td>
                      <td className="product-quantity">{product.quantity}</td>
                      <td className="product-actions">
                        <button 
                          className="btn-action btn-view"
                          onClick={() => handleView(product)}
                          title="Xem chi tiết"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(product)}
                          title="Chỉnh sửa"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(product.id_product, product.name_product)}
                          title="Xóa"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              « Trước
            </button>

            {getPageItems(pagination.totalPages, pagination.page).map((item, idx) => {
              if (item === 'left-ellipsis' || item === 'right-ellipsis') {
                return (
                  <span key={`e-${idx}`} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  className={pagination.page === item ? 'active' : ''}
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </button>
              );
            })}

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau »
            </button>
          </div>
        )}

        {showViewModal && (
          <ProductViewModal
            product={selectedProduct}
            onClose={() => {
              setShowViewModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminProducts;