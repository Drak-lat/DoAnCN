import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faComments } from '@fortawesome/free-solid-svg-icons';
import './AdminHeader.css';

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h2>ADMIN PANEL</h2>
      </div>
      <div className="admin-header-right">
        {/* Tin nhắn */}
        <Link to="/admin/messages" className="header-messages">
          <FontAwesomeIcon icon={faComments} />
          <span>Tin nhắn</span>
        </Link>
        
        {/* Thông tin user */}
        <Link to="/admin/profile" className="admin-user-info">
          <FontAwesomeIcon icon={faUser} />
          <span>{user.username || 'Admin'}</span>
        </Link>
        
        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;