import React, { useState } from 'react';
import './Login.css';
import { login as loginService } from '../../../services/authService';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [loginType, setLoginType] = useState('phone');
  const [form, setForm] = useState({ phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let identifier = loginType === 'phone' ? form.phone : form.email;
    if (!identifier || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      setLoading(false);
      return;
    }

    try {
      const response = await loginService({
        identifier,
        password: form.password,
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate(response.data.redirect || '/');
      } else {
        setError(response.data.msg || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Lỗi kết nối server!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>ĐĂNG NHẬP</h2>
        <div className="login-type-tab">
          <div
            className={loginType === 'phone' ? 'tab active' : 'tab'}
            onClick={() => setLoginType('phone')}
          >
            SĐT
          </div>
          <div
            className={loginType === 'email' ? 'tab active' : 'tab'}
            onClick={() => setLoginType('email')}
          >
            Email
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="inputs-row">
            {loginType === 'phone' ? (
              <div className="input-group">
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Số điện thoại"
                  required
                />
              </div>
            ) : (
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
              </div>
            )}
            <div className="input-group">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                required
              />
            </div>
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </button>
        </form>
        <div className="or-wrap">
          <div className="or-line"></div>
          <div className="or-text">----------------------HOẶC----------------------</div>
          <div className="or-line"></div>
        </div>
        <div className="register-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;