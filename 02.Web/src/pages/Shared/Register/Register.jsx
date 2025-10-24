import React, { useState } from 'react';
import './Register.css';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

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

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    try {
      const data =
        registerType === 'phone'
          ? { phone: formData.phone, username: formData.username, password: formData.password }
          : { email: formData.email, username: formData.username, password: formData.password };

      const response = await api.post('/customer/register', data);
      // Đăng ký thành công, chuyển về trang đăng nhập
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại!');
      }
    }
  };

  return (
      <div className="register-container">
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
  );
}

export default Register;