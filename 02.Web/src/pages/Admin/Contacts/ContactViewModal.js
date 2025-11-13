import React from 'react';
import './ContactModal.css';

function ContactViewModal({ contact, onClose }) {
  if (!contact) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết liên hệ</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="contact-info-section">
            <div className="info-header">
              <div className="contact-avatar">
                👤
              </div>
              <div className="contact-basic-info">
                <h3>{contact.name_contact}</h3>
                <p className="contact-phone">
                  📞 {contact.phone_contact}
                </p>
                <p className="contact-date">
                  📅 {formatDate(contact.date_contact)}
                </p>
              </div>
            </div>
          </div>

          <div className="contact-content-section">
            <h4>Nội dung liên hệ:</h4>
            <div className="contact-text-content">
              {contact.text_contact}
            </div>
          </div>

          <div className="contact-actions-section">
            <div className="action-buttons">
              <a 
                href={`tel:${contact.phone_contact}`} 
                className="btn btn-call"
              >
                📞 Gọi điện
              </a>
              <button 
                className="btn btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(contact.phone_contact);
                  alert('Đã sao chép số điện thoại');
                }}
              >
                📋 Sao chép SĐT
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactViewModal;