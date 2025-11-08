import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import { changePassword } from '../../../services/profileService';
import './AdminProfile.css';

function AdminChangePassword() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.msg || 'Đổi mật khẩu thất bại' 
      });
    }
  };

  const handleInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <h1>Đổi mật khẩu</h1>
          <p>Thay đổi mật khẩu tài khoản Admin</p>
          <div className="admin-profile-actions">
            <button 
              className="btn-back"
              onClick={() => navigate('/admin/profile')}
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`admin-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </div>
        )}

        <div className="admin-profile-content">
          <form onSubmit={handleSubmit} className="admin-password-form">
            <div className="admin-input-group">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div className="admin-input-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
                required
              />
              <small>Mật khẩu phải có ít nhất 10 ký tự gồm chữ và số</small>
            </div>

            <div className="admin-input-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <button type="submit" className="admin-profile-btn">
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminChangePassword;