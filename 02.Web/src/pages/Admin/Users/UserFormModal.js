import React, { useState } from 'react';
import { createUser } from '../../../services/userService';
import './UserModal.css';

function UserFormModal({ type = 'add', user = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    confirmPassword: '',
    name_information: user?.Information?.name_information || '',
    phone_information: user?.Information?.phone_information || '',
    email: user?.Information?.email || '',
    date_of_birth: user?.Information?.date_of_birth ? user.Information.date_of_birth.split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error khi user nhập lại
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới';
    }

    // Validate password
    if (type === 'add') {
      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      // Validate confirm password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    // Validate email (optional)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone (optional)
    if (formData.phone_information && !/^[0-9]{10,11}$/.test(formData.phone_information)) {
      newErrors.phone_information = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate date of birth
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        newErrors.date_of_birth = 'Ngày sinh không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = { ...formData };
      
      // Remove confirmPassword before sending
      delete dataToSend.confirmPassword;
      
      // Remove empty fields
      Object.keys(dataToSend).forEach(key => {
        if (!dataToSend[key]) {
          delete dataToSend[key];
        }
      });

      const response = await createUser(dataToSend);
      
      if (response?.data?.success) {
        alert('Thêm khách hàng thành công!');
        onSave && onSave();
      } else {
        alert(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Create user error:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'add' ? 'Thêm khách hàng mới' : 'Chỉnh sửa khách hàng'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3>Thông tin tài khoản</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Tên đăng nhập <span className="required">*</span></label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    disabled={type === 'edit'}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>
              </div>
              
              {type === 'add' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Nhập mật khẩu"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu <span className="required">*</span></label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h3>Thông tin cá nhân</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name_information">Họ và tên</label>
                  <input
                    type="text"
                    id="name_information"
                    name="name_information"
                    value={formData.name_information}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date_of_birth">Ngày sinh</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                  />
                  {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Nhập email"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone_information">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phone_information"
                    name="phone_information"
                    value={formData.phone_information}
                    onChange={handleInputChange}
                    className={`form-control ${errors.phone_information ? 'is-invalid' : ''}`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone_information && <div className="invalid-feedback">{errors.phone_information}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang xử lý...
                </>
              ) : (
                type === 'add' ? 'Thêm khách hàng' : 'Cập nhật'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;