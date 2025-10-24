// ...existing code...
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken, logoutLocal } from '../../utils/auth';
import './AdminPage.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const user = getUserFromToken() || {};
  const [active, setActive] = useState('customers');

  const handleLogout = () => {
    logoutLocal();
    navigate('/login', { replace: true });
  };

  const menu = [
    { key: 'books', label: 'Quản lí sách' },
    { key: 'messages', label: 'Quản lí tin nhắn' },
    { key: 'orders', label: 'Quản lí đơn hàng' },
    { key: 'feedback', label: 'Quản lí phản hồi sản phẩm' },
    { key: 'profile', label: 'Quản lí thông tin cá nhân' },
    { key: 'contacts', label: 'Quản lí liên hệ' },
    { key: 'customers', label: 'Quản lí khách hàng' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-title">HAVANABOOK</div>
          <div className="brand-sub">MANAGER</div>
        </div>

        <nav className="sidebar-menu">
          {menu.map((m) => (
            <div
              key={m.key}
              className={`menu-item ${active === m.key ? 'active' : ''}`}
              onClick={() => {
                if (m.key === 'profile') {
                  // chuyển trang tới AdminInfo
                  navigate('/admin/info');
                } else {
                  setActive(m.key);
                }
              }}
            >
              {m.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} type="button">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* rest of main unchanged */}
    </div>
  );
}
// ...existing code...