import React, { useState } from 'react';
import './ForgotPassword.css';
import { forgotPassword } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Nhập SĐT/Email, 2: Nhập OTP + Mật khẩu
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(''); // Để hiển thị OTP
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!identifier) {
      setError('Vui lòng nhập số điện thoại hoặc email!');
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword({ identifier });
      
      if (response.data.success) {
        setMessage(response.data.msg);
        setGeneratedOTP(response.data.otp); // Lưu OTP để hiển thị
        setStep(2);
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!verificationCode || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (password.length < 10) {
      setError('Mật khẩu phải có ít nhất 10 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ 
        identifier, 
        password, 
        verificationCode 
      });
      
      if (response.data.success) {
        setMessage(response.data.msg);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.msg);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="forgot-password-container" style={{ marginTop: '70px' }}>
        <div className="forgot-password-box">
          <h2>QUÊN MẬT KHẨU</h2>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          {step === 1 ? (
            // Bước 1: Nhập SĐT/Email
            <form className="forgot-password-form" onSubmit={handleSendOTP}>
              <div className="input-group">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nhập số điện thoại hoặc email"
                  required
                />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
              <div className="back-to-login">
                <a href="/login">Quay lại đăng nhập</a>
              </div>
            </form>
          ) : (
            // Bước 2: Nhập OTP + Mật khẩu mới
            <form className="forgot-password-form" onSubmit={handleResetPassword}>
              {generatedOTP && (
                <div className="otp-display">
                  <p>🔐 Mã OTP của bạn: <strong>{generatedOTP}</strong></p>
                  <p className="otp-note">(Trong thực tế sẽ gửi qua SMS/Email)</p>
                </div>
              )}
              
              <div className="input-group">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Nhập mã xác thực 6 số"
                  maxLength={6}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </div>
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
              <div className="back-to-login">
                <button type="button" onClick={() => setStep(1)}>
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPassword;