import React, { useState, useEffect, useCallback } from 'react';
import { getAllOrders } from '../../../services/orderService';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import OrderViewModal from './OrderViewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faEye } from '@fortawesome/free-solid-svg-icons';
import './AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    payment_status: ''
  });
  const [pagination, setPagination] = useState({});

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        payment_status: filters.payment_status
      };
      
      const response = await getAllOrders(params);
      
      if (response?.data?.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Load orders error:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách đơn hàng: ' + error.message });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = {
      'Chờ xác nhận': { class: 'warning', text: 'Chờ xác nhận' },
      'Đã xác nhận': { class: 'info', text: 'Đã xác nhận' },
      'Đang giao': { class: 'primary', text: 'Đang giao' }
    };

    const paymentConfig = {
      'Chưa thanh toán': { class: 'warning', text: 'Chưa thanh toán' },
      'Đã thanh toán': { class: 'success', text: 'Đã thanh toán' }
    };

    const config = type === 'order' ? statusConfig[status] : paymentConfig[status];
    
    // ✅ THÊM: Fallback nếu không tìm thấy status
    if (!config) {
      return <span className="badge badge-secondary">{status || 'Không xác định'}</span>;
    }
    
    return <span className={`badge badge-${config.class}`}>{config.text}</span>;
  };

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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  return (
    <AdminLayout>
      <div className="admin-orders">
        <div className="orders-header">
          <h1>Quản lý đơn hàng</h1>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </div>
        )}

        <div className="orders-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng (mã đơn, tên người nhận)..."
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
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đang giao">Đang giao</option>
            </select>

            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value, page: 1 })}
            >
              <option value="">Tất cả thanh toán</option>
              <option value="Chưa thanh toán">Chưa thanh toán</option>
              <option value="Đã thanh toán">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div className="orders-table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái đơn hàng</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order.id_order}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="order-id">#{order.id_order}</td>
                      <td>
                        <div>
                          <div className="customer-name">{order.receiver_name || 'N/A'}</div>
                          <small>{order.Login?.username || 'N/A'}</small>
                        </div>
                      </td>
                      <td className="order-total">{formatPrice(order.total)}</td>
                      <td>{formatDate(order.date_order)}</td>
                      <td>{getStatusBadge(order.order_status, 'order')}</td>
                      <td>{getStatusBadge(order.payment_status, 'payment')}</td>
                      <td className="order-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewOrder(order)}
                          title="Xem chi tiết"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      Không có đơn hàng nào
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
          <OrderViewModal
            order={selectedOrder}
            onClose={() => {
              setShowViewModal(false);
              setSelectedOrder(null);
            }}
            onStatusUpdate={() => {
              loadOrders();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;