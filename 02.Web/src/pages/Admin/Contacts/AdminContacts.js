import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import ContactViewModal from './ContactViewModal';
import { getAllContacts, deleteContact } from '../../../services/contactService'; // ✅ THÊM import
import './AdminContacts.css';

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination & Search
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [pagination, setPagination] = useState({});

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search
      };
      
      // ✅ THÊM: Gọi API
      const response = await getAllContacts(params);
      
      if (response.data.success) {
        setContacts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Không thể tải danh sách liên hệ: ' + error.message 
      });
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.search]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  const handleDeleteContact = async (contactId, contactName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa liên hệ của "${contactName}"?`)) {
      try {
        await deleteContact(contactId);
        setMessage({ type: 'success', text: 'Xóa liên hệ thành công!' });
        loadContacts();
      } catch (error) {
        setMessage({ type: 'error', text: 'Lỗi khi xóa liên hệ: ' + error.message });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  return (
    <AdminLayout>
      <div className="admin-contacts">
        <div className="contacts-header">
          <h1>Quản lý liên hệ</h1>
          <div className="contacts-stats">
            <span className="stat-item">
              📞 Tổng: {pagination.totalItems || 0} liên hệ
            </span>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </div>
        )}

        <div className="contacts-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <button type="submit">🔍</button>
            </div>
          </form>
        </div>

        <div className="contacts-table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Số điện thoại</th>
                  <th>Nội dung</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <tr key={contact.id_contact}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td className="contact-name">{contact.name_contact}</td>
                      <td>
                        <span className="phone-number">
                          📞 {contact.phone_contact}
                        </span>
                      </td>
                      <td className="contact-text">{truncateText(contact.text_contact)}</td>
                      <td>
                        <span className="contact-date">
                          📅 {formatDate(contact.date_contact)}
                        </span>
                      </td>
                      <td className="contact-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewContact(contact)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteContact(contact.id_contact, contact.name_contact)}
                          title="Xóa liên hệ"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      Chưa có liên hệ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              « Trước
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={pagination.page === page ? 'active' : ''}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Sau »
            </button>
          </div>
        )}

        {/* Modal xem chi tiết */}
        {showViewModal && (
          <ContactViewModal
            contact={selectedContact}
            onClose={() => {
              setShowViewModal(false);
              setSelectedContact(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminContacts;