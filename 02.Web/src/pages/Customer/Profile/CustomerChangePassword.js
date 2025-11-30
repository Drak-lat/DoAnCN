import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { changePassword } from '../../../services/profileService';
import './CustomerProfile.css';

function CustomerChangePassword() {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <Header />
      <div className="customer-profile-page">
        <div className="customer-profile-container">
          <div className="customer-profile-header">
            <h1>Đổi mật khẩu</h1>
            <p>Thay đổi mật khẩu tài khoản của bạn</p>
          </div>

          {message.text && (
            <div className={`customer-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          {/* Menu Navigation cho Customer */}
          <div className="customer-profile-menu">
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/profile')}
            >
              Thông tin cá nhân
            </div>
            <div className="customer-menu-item active">
              Đổi mật khẩu
            </div>
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/orders')}
            >
              Đơn hàng của tôi
            </div>
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/reviews')}
            >
              Nhận xét của tôi
            </div>
            <div 
              className="customer-menu-item logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </div>
          </div>

          <div className="customer-profile-content">
            <form onSubmit={handleSubmit} className="customer-password-form">
              <div className="customer-input-group">
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

              <div className="customer-input-group">
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

              <div className="customer-input-group">
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

              <button type="submit" className="customer-profile-btn">
                Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerChangePassword;