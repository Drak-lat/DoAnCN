import React, { useState } from 'react';
import './Register.css';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header'; // ✅ Thêm import Header

function Register() {
  const [registerType, setRegisterType] = useState('phone');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi lên server
      const registerData = {
        username: formData.username,
        password: formData.password,
      };

      // Thêm phone hoặc email tùy theo registerType
      if (registerType === 'phone') {
        registerData.phone = formData.phone;
      } else {
        registerData.email = formData.email;
      }

      const response = await api.post('/customer/register', registerData);
      
      // ✅ Sử dụng response để xử lý kết quả
      if (response.data.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setError(response.data.msg || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.msg || 'Có lỗi xảy ra khi đăng ký!');
      } else {
        setError('Không thể kết nối đến server!');
      }
    }
  };

  return (
    <>
      <Header /> {/* ✅ Thêm Header */}
      <div className="register-container" style={{ marginTop: '70px' }}> {/* ✅ Thêm marginTop */}
        <div className="register-box">
          <h2>ĐĂNG KÍ</h2>
          <div className="register-type-tab">
            <div
              className={registerType === 'phone' ? 'tab active' : 'tab'}
              onClick={() => setRegisterType('phone')}
            >
              SĐT
            </div>
            <div
              className={registerType === 'email' ? 'tab active' : 'tab'}
              onClick={() => setRegisterType('email')}
            >
              Email
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <form className="register-form" onSubmit={handleRegister}>
            <div className="inputs-row">
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
              {registerType === 'phone' ? (
                <>
                  <div className="input-group">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <button className="register-btn" type="submit">
              ĐĂNG KÍ
            </button>
          </form>
          <div className="or-wrap">
            <div className="or-line"></div>
            <div className="or-text">----------------------HOẶC----------------------</div>
            <div className="or-line"></div>
          </div>
          <div className="login-link">
            Bạn đã có tài khoản? <a href="/login">Đăng nhập.</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;