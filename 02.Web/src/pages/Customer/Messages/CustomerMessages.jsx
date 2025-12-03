import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getMyMessages, sendMessageToAdmin, getAvailableAdmins } from '../../../services/messageService';
import socketService from '../../../services/socketService';
import './CustomerMessages.css';

const CustomerMessages = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch danh sách admin (id_level = 1)
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await getAvailableAdmins();
      if (response.success) {
        const adminList = response.data.admins || [];
        setAdmins(adminList);
      }
    } catch (err) {
      console.error('Fetch admins error:', err);
      setError('Không thể tải danh sách admin');
    }
  }, []);

  // Fetch tin nhắn với admin cụ thể
  const fetchMessages = useCallback(async (adminId) => {
    if (!adminId) return;
    
    try {
      setLoading(true);
      const response = await getMyMessages(adminId);
      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load danh sách admin khi component mount
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Xử lý realtime message và load messages khi chọn admin
  useEffect(() => {
    if (!selectedAdmin) return;

    // Load tin nhắn với admin được chọn
    fetchMessages(selectedAdmin.id_login);
    
    // Kết nối socket
    socketService.connect(currentUser.id_login);

    // Xử lý tin nhắn realtime
    const handleNewMessage = (data) => {
      const messageReceiverIsMe = data.receiverId === currentUser.id_login;
      const messageSenderIsMe = data.senderId === currentUser.id_login;
      const messageSenderIsSelectedAdmin = data.senderId === selectedAdmin.id_login;
      const messageReceiverIsSelectedAdmin = data.receiverId === selectedAdmin.id_login;

      // Chỉ update nếu tin nhắn liên quan đến admin đang được chọn
      if (
        (messageReceiverIsMe && messageSenderIsSelectedAdmin) ||
        (messageSenderIsMe && messageReceiverIsSelectedAdmin)
      ) {
        fetchMessages(selectedAdmin.id_login);
      }
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [selectedAdmin, currentUser.id_login, fetchMessages]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Chọn admin để nhắn tin
  const handleSelectAdmin = (admin, index) => {
    setSelectedAdmin({ 
      ...admin, 
      displayName: `Admin ${index + 1}`, 
      displayIndex: index 
    });
    setError('');
    setMessages([]);
  };

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    if (!selectedAdmin) {
      setError('Vui lòng chọn admin để nhắn tin');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      const response = await sendMessageToAdmin(newMessage.trim(), selectedAdmin.id_login);
      
      if (response.success) {
        setNewMessage('');
        // Refresh messages để hiển thị tin nhắn mới
        await fetchMessages(selectedAdmin.id_login);
      }
    } catch (err) {
      setError(err.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (date.toDateString() === today.toDateString()) {
      return `Hôm nay ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hôm qua ${timeStr}`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <>
      <Header />
      <div className="customer-messages-page">
        <div className="messages-container">
          <div className="messages-header">
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Quay lại
            </button>
            <h2>Tin nhắn với Admin</h2>
          </div>

          <div className="admin-selector">
            <label>Chọn Admin:</label>
            <div className="admin-list">
              {admins.map((admin, index) => (
                <button
                  key={admin.id_login}
                  className={`admin-item ${selectedAdmin?.id_login === admin.id_login ? 'active' : ''}`}
                  onClick={() => handleSelectAdmin(admin, index)}
                >
                  <div className="admin-avatar">{index + 1}</div>
                  <span>Admin {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {!selectedAdmin ? (
            <div className="no-admin-selected">
              <p>Vui lòng chọn admin để bắt đầu trò chuyện</p>
            </div>
          ) : loading ? (
            <div className="loading">Đang tải tin nhắn...</div>
          ) : (
            <div className="messages-content">
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>Chưa có tin nhắn nào với {selectedAdmin.displayName}</p>
                    <p className="hint">Hãy gửi tin nhắn đầu tiên!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div 
                        key={msg.id_message} 
                        className={`message-item ${msg.id_sender === currentUser.id_login ? 'sent' : 'received'}`}
                      >
                        <div className="message-bubble">
                          <div className="message-sender">
                            {msg.id_sender === currentUser.id_login ? 'Bạn' : selectedAdmin.displayName}
                          </div>
                          <div className="message-content">{msg.content}</div>
                          <div className="message-time">{formatTime(msg.created_at)}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Nhập tin nhắn gửi ${selectedAdmin.displayName}...`}
                  rows="3"
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerMessages;