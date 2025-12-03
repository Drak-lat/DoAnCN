import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../../../components/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader/AdminHeader';
import { 
  getCustomersWithMessages, 
  getMessagesWithCustomer, 
  sendMessageToCustomer 
} from '../../../services/messageService';
import socketService from '../../../services/socketService';
import './AdminMessages.css';

function AdminMessages() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const selectedCustomerRef = useRef(selectedCustomer); // ⭐ Dùng ref để tránh stale closure
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // ⭐ Update ref mỗi khi selectedCustomer thay đổi
  useEffect(() => {
    selectedCustomerRef.current = selectedCustomer;
  }, [selectedCustomer]);

  useEffect(() => {
    fetchCustomers();
    
    socketService.connect(currentUser.id_login);

    const handleNewMessage = (data) => {
      fetchCustomers();
      
      const currentSelectedCustomer = selectedCustomerRef.current;
      
      if (currentSelectedCustomer && 
          (data.receiverId === currentSelectedCustomer.id_login || 
           data.senderId === currentSelectedCustomer.id_login)) {
        fetchMessages(currentSelectedCustomer.id_login);
      }
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⭐ Empty array - chỉ setup 1 lần

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer.id_login);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomersWithMessages();
      if (response.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
      setError('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      setLoadingMessages(true);
      const response = await getMessagesWithCustomer(customerId);
      if (response.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setError('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedCustomer) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      const response = await sendMessageToCustomer(
        selectedCustomer.id_login, 
        newMessage.trim()
      );
      
      if (response.success) {
        setNewMessage('');
        // Socket sẽ tự update
      }
    } catch (err) {
      setError(err.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const formatDetailTime = (dateString) => {
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
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <div className="messages-page">
            <div className="messages-layout">
              {/* Left Sidebar - Danh sách khách hàng */}
              <div className="customers-sidebar">
                <div className="sidebar-header">
                  <h3>Tin nhắn</h3>
                  <button onClick={fetchCustomers} className="btn-refresh">
                    🔄
                  </button>
                </div>

                {loading ? (
                  <div className="sidebar-loading">Đang tải...</div>
                ) : customers.length === 0 ? (
                  <div className="no-customers">
                    <p>Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  <div className="customers-list">
                    {customers.map((customer) => (
                      <div
                        key={customer.id_login}
                        className={`customer-item ${selectedCustomer?.id_login === customer.id_login ? 'active' : ''}`}
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="customer-avatar">
                          {customer.name_information?.charAt(0) || customer.username?.charAt(0) || 'U'}
                        </div>
                        <div className="customer-info">
                          <div className="customer-name">
                            {customer.name_information || customer.username}
                          </div>
                          <div className="last-message">{customer.last_message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Content - Chat box */}
              <div className="chat-content">
                {!selectedCustomer ? (
                  <div className="no-chat-selected">
                    <div className="empty-state">
                      <div className="empty-icon">💬</div>
                      <h3>Chọn một khách hàng để bắt đầu trò chuyện</h3>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chat-header">
                      <div className="chat-user-info">
                        <div className="chat-avatar">
                          {selectedCustomer.name_information?.[0]?.toUpperCase() || 
                           selectedCustomer.username[0].toUpperCase()}
                        </div>
                        <div className="chat-user-details">
                          <h4>{selectedCustomer.name_information || selectedCustomer.username}</h4>
                          <span className="user-status">@{selectedCustomer.username}</span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="chat-error">{error}</div>
                    )}

                    <div className="chat-messages">
                      {loadingMessages ? (
                        <div className="messages-loading">Đang tải tin nhắn...</div>
                      ) : messages.length === 0 ? (
                        <div className="no-messages">
                          <p>Chưa có tin nhắn nào</p>
                        </div>
                      ) : (
                        <>
                          {messages.map((msg) => (
                            <div
                              key={msg.id_message}
                              className={`message-item ${
                                msg.id_sender === currentUser.id_login ? 'sent' : 'received'
                              }`}
                            >
                              <div className="message-bubble">
                                <div className="message-sender">
                                  {msg.id_sender === currentUser.id_login
                                    ? 'Bạn'
                                    : selectedCustomer.name_information || selectedCustomer.username}
                                </div>
                                <div className="message-content">{msg.content}</div>
                                <div className="message-time">
                                  {formatDetailTime(msg.created_at)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    <form className="chat-input" onSubmit={handleSendMessage}>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        rows="3"
                        disabled={sending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? '⏳' : '➤'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;