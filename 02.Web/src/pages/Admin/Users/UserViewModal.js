import React from 'react';
import './UserModal.css';

function UserViewModal({ user, onClose }) {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getUserStatus = (idLevel) => {
    switch(idLevel) {
      case 1: return { text: 'Admin', class: 'warning' };
      case 2: return { text: 'Khách hàng hoạt động', class: 'success' };
      case 3: return { text: 'Tài khoản đã xóa', class: 'danger' };
      default: return { text: 'Không xác định', class: 'secondary' };
    }
  };

  const status = getUserStatus(user.id_level);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thông tin chi tiết khách hàng</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="row">
            {/* Avatar Section */}
            <div className="col-md-4 text-center">
              <div className="user-avatar-section">
                {user.Information?.avatar ? (
                  <img 
                    src={`http://localhost:3000/uploads/avatars/${user.Information.avatar}`}
                    alt="Avatar"
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png'; // Fallback avatar
                    }}
                  />
                ) : (
                  <div className="default-avatar">
                    <i className="fas fa-user fa-4x"></i>
                  </div>
                )}
                <h4 className="mt-3">{user.Information?.name_information || 'Chưa cập nhật'}</h4>
                <span className={`badge badge-${status.class}`}>{status.text}</span>
              </div>
            </div>

            {/* User Information */}
            <div className="col-md-8">
              <div className="form-section">
                <h3>Thông tin tài khoản</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>ID tài khoản:</label>
                    <span className="form-value">{user.id_login}</span>
                  </div>
                  <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <span className="form-value">{user.username}</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày đăng ký:</label>
                    <span className="form-value">{formatDate(user.date_register)}</span>
                  </div>
                  <div className="form-group">
                    <label>Quyền:</label>
                    <span className="form-value">{user.AccessLevel?.name_level || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Thông tin cá nhân</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên:</label>
                    <span className="form-value">{user.Information?.name_information || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh:</label>
                    <span className="form-value">{formatDate(user.Information?.date_of_birth)}</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email:</label>
                    <span className="form-value">{user.Information?.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại:</label>
                    <span className="form-value">{user.Information?.phone_information || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserViewModal;