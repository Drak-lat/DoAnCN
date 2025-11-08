import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import { getProfile, updateProfile } from '../../../services/profileService';
import './AdminProfile.css';

function AdminProfile() {
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
      console.error('Admin Profile fetch error:', error);
      setMessage({ type: 'error', text: 'Không thể tải thông tin cá nhân' });
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-profile-loading">Đang tải thông tin...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <h1>Thông tin tài khoản Admin</h1>
          <p>Quản lý thông tin cá nhân của bạn</p>
          <div className="admin-profile-actions">
            <button 
              className="btn-change-password"
              onClick={() => navigate('/admin/change-password')}
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`admin-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </div>
        )}

        <div className="admin-profile-content">
          <div className="admin-profile-summary">
            <div className="admin-user-avatar">
              <div className="admin-avatar-placeholder">
                {profile.username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <div className="admin-user-basic">
              <h3>Tên đăng nhập: {profile.username}</h3>
              <p className="admin-user-level">
                Loại tài khoản: <span className="admin-level-badge">ADMIN</span>
              </p>
              <p>Ngày tạo tài khoản: {new Date(profile.date_register).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-profile-form">
            <div className="admin-inputs-row">
              <div className="admin-input-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="name_information"
                  value={formData.name_information}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="admin-input-group">
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

            <div className="admin-inputs-row">
              <div className="admin-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                />
              </div>
              <div className="admin-input-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="admin-profile-btn">
              Cập nhật thông tin
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;