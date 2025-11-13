import React, { useState } from 'react';
import './Contact.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';

function Contact() {
  const [formData, setFormData] = useState({
    name_contact: '',
    phone_contact: '',
    text_contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Xóa error khi user nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_contact.trim()) {
      newErrors.name_contact = 'Họ và tên là bắt buộc';
    }

    if (!formData.phone_contact.trim()) {
      newErrors.phone_contact = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone_contact.trim())) {
      newErrors.phone_contact = 'Số điện thoại phải có 10-11 chữ số';
    }

    if (!formData.text_contact.trim()) {
      newErrors.text_contact = 'Nội dung liên hệ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Chỉ cần đảm bảo API call đúng:
      const response = await api.post('/customer/contact', {
        name_contact: formData.name_contact.trim(),
        phone_contact: formData.phone_contact.trim(),
        text_contact: formData.text_contact.trim()
      });
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: response.data.message || 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.' 
        });
        
        // Reset form
        setFormData({
          name_contact: '',
          phone_contact: '',
          text_contact: ''
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="contact-page" style={{ marginTop: '70px' }}>
        <div className="contact-container">
          <div className="contact-header">
            <button onClick={handleBackHome} className="back-btn">
              ← Quay lại trang chủ
            </button>
            <h1>📞 Liên Hệ Với Chúng Tôi</h1>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn! Hãy để lại thông tin và chúng tôi sẽ liên hệ lại sớm nhất.</p>
          </div>

          {message.text && (
            <div className={`contact-message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
              {message.text}
            </div>
          )}

          <div className="contact-content">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label htmlFor="name_contact">Họ và tên *</label>
                <input
                  type="text"
                  id="name_contact"
                  name="name_contact"
                  value={formData.name_contact}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={loading}
                  className={errors.name_contact ? 'error' : ''}
                />
                {errors.name_contact && (
                  <span className="error-text">{errors.name_contact}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="phone_contact">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone_contact"
                  name="phone_contact"
                  value={formData.phone_contact}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại (10-11 số)"
                  disabled={loading}
                  className={errors.phone_contact ? 'error' : ''}
                  maxLength="11"
                />
                {errors.phone_contact && (
                  <span className="error-text">{errors.phone_contact}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="text_contact">Nội dung liên hệ *</label>
                <textarea
                  id="text_contact"
                  name="text_contact"
                  value={formData.text_contact}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung cần hỗ trợ, tư vấn..."
                  rows="6"
                  disabled={loading}
                  className={errors.text_contact ? 'error' : ''}
                  maxLength="500"
                />
                <div className="char-count">
                  {formData.text_contact.length}/500 ký tự
                </div>
                {errors.text_contact && (
                  <span className="error-text">{errors.text_contact}</span>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi liên hệ'
                )}
              </button>
            </form>

            <div className="contact-info">
              <h3>Thông tin liên hệ khác</h3>
              <div className="contact-info-grid">
                <div className="info-item">
                  <div className="info-icon">📧</div>
                  <div className="info-content">
                    <strong>Email hỗ trợ</strong>
                    <p>support@company.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">📱</div>
                  <div className="info-content">
                    <strong>Hotline</strong>
                    <p>1900 1234 (24/7)</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <strong>Địa chỉ</strong>
                    <p>123 Đường ABC, Quận XYZ, TP.HCM</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">⏰</div>
                  <div className="info-content">
                    <strong>Giờ làm việc</strong>
                    <p>8:00 - 17:00 (Thứ 2 - Thứ 7)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;