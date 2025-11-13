import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUser, restoreUser } from '../../../services/userService';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import UserFormModal from './UserFormModal';
import UserViewModal from './UserViewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faFilter, faEye, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination & Search
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    showDeleted: false
  });
  const [pagination, setPagination] = useState({});

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        includeDeleted: filters.showDeleted
      };
      
      const response = await getAllUsers(params);
      
      if (response?.data?.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách khách hàng: ' + error.message });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.search, filters.showDeleted]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${username}"?`)) {
      try {
        await deleteUser(userId);
        setMessage({ type: 'success', text: 'Xóa khách hàng thành công!' });
        loadUsers();
      } catch (error) {
        setMessage({ type: 'error', text: 'Lỗi khi xóa khách hàng: ' + error.message });
      }
    }
  };

  const handleRestoreUser = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục khách hàng "${username}"?`)) {
      try {
        await restoreUser(userId);
        setMessage({ type: 'success', text: 'Khôi phục khách hàng thành công!' });
        loadUsers();
      } catch (error) {
        setMessage({ type: 'error', text: 'Lỗi khi khôi phục khách hàng: ' + error.message });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getUserStatusBadge = (idLevel) => {
    switch(idLevel) {
      case 1: return <span className="badge badge-warning">Admin</span>;
      case 2: return <span className="badge badge-success">Hoạt động</span>;
      case 3: return <span className="badge badge-danger">Đã xóa</span>;
      default: return <span className="badge badge-secondary">Không xác định</span>;
    }
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
      <div className="admin-users">
        <div className="users-header">
          <h1>Quản lý khách hàng</h1>
          <button className="btn-add-user" onClick={() => setShowAddModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Thêm khách hàng
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </div>
        )}

        <div className="users-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
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
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showDeleted}
                onChange={(e) => setFilters({ ...filters, showDeleted: e.target.checked, page: 1 })}
              />
              <span>Hiển thị tài khoản đã xóa</span>
            </label>
          </div>
        </div>

        <div className="users-table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Username</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id_login}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="user-username">{user.username}</td>
                      <td>{user.Information?.name_information || 'Chưa cập nhật'}</td>
                      <td>{user.Information?.email || 'Chưa cập nhật'}</td>
                      <td>{user.Information?.phone_information || 'Chưa cập nhật'}</td>
                      <td>{formatDate(user.date_register)}</td>
                      <td>{getUserStatusBadge(user.id_level)}</td>
                      <td className="user-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewUser(user)}
                          title="Xem chi tiết"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {user.id_level === 2 && (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(user.id_login, user.username)}
                            title="Xóa khách hàng"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                        {user.id_level === 3 && (
                          <button
                            className="btn-action btn-restore"
                            onClick={() => handleRestoreUser(user.id_login, user.username)}
                            title="Khôi phục"
                          >
                            <FontAwesomeIcon icon={faUndo} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      Không có khách hàng nào
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

        {/* Modals */}
        {showViewModal && (
          <UserViewModal
            user={selectedUser}
            onClose={() => {
              setShowViewModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {showAddModal && (
          <UserFormModal
            type="add"
            onClose={() => setShowAddModal(false)}
            onSave={() => {
              setShowAddModal(false);
              loadUsers();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;