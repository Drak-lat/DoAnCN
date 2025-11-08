import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { getProfile, updateProfile } from '../../../services/profileService';
import './CustomerProfile.css';

function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    name_information: '',
    phone_information: '',
    email: '',
    date_of_birth: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          name_information: data.information?.name_information || '',
          phone_information: data.information?.phone_information || '',
          email: data.information?.email || '',
          date_of_birth: data.information?.date_of_birth ? 
            new Date(data.information.date_of_birth).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Customer Profile fetch error:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await updateProfile(formData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        fetchProfile();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.msg || 'Cập nhật thất bại' 
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{marginTop: '100px'}} className="customer-profile-loading">
          Đang tải thông tin...
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{marginTop: '100px', padding: '20px', minHeight: '100vh', background: '#f8fafc'}}>
        <div className="customer-profile-container">
          <div className="customer-profile-header">
            <h1>Tài khoản của tôi</h1>
            <p>Quản lý thông tin tài khoản của bạn</p>
          </div>

          {message.text && (
            <div className={`customer-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          {/* Menu Navigation cho Customer */}
          <div className="customer-profile-menu">
            <div className="customer-menu-item active">
              Thông tin cá nhân
            </div>
            <div 
              className="customer-menu-item"
              onClick={() => navigate('/customer/change-password')}
            >
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
            <div className="customer-profile-summary">
              <div className="customer-user-avatar">
                <div className="customer-avatar-placeholder">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="customer-user-basic">
                <h3>Tên đăng nhập: {profile.username}</h3>
                <p className="customer-user-level">
                  Loại tài khoản: <span className="customer-level-badge">KHÁCH HÀNG</span>
                </p>
                <p>Ngày tạo tài khoản: {new Date(profile.date_register).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="customer-profile-form">
              <div className="customer-inputs-row">
                <div className="customer-input-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="name_information"
                    value={formData.name_information}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="customer-input-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone_information"
                    value={formData.phone_information}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="customer-inputs-row">
                <div className="customer-input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="customer-input-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button type="submit" className="customer-profile-btn">
                Cập nhật thông tin
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerProfile;