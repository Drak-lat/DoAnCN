import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { getMyMessages, sendMessageToAdmin } from '../../../services/messageService';
import './CustomerMessages.css';

const CustomerMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getMyMessages();
      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      const response = await sendMessageToAdmin(newMessage.trim());
      
      if (response.success) {
        setMessages([...messages, response.data]);
        setNewMessage('');
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="customer-messages-page">
          <div className="messages-container">
            <div className="loading">Đang tải tin nhắn...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="messages-content">
            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Chưa có tin nhắn nào</p>
                  <p className="hint">Hãy gửi tin nhắn đầu tiên cho chúng tôi!</p>
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
                          {msg.id_sender === currentUser.id_login 
                            ? 'Bạn' 
                            : 'Admin'}
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
                placeholder="Nhập tin nhắn của bạn..."
                rows="3"
                disabled={sending}
              />
              <button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerMessages;