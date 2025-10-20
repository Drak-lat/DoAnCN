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
    { key: 'customers', label: 'Quản lí khách hàng' }, // default view in screenshot
  ];

  // sample rows (thay bằng data thực tế khi có)
  const sampleRows = [
    { code: 'A0001', name: 'Nguyen Van A', contact: '098765423', addr: 'P9, Thủ Đức' },
    { code: 'A0002', name: 'Nguyen Van B', contact: 'nguyenB@gmail.com', addr: 'P4, Phú Nhuận' },
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
              onClick={() => setActive(m.key)}
            >
              {m.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h2 className="page-title">Quản Lí Khách Hàng</h2>
          <div className="topbar-actions">
            <div className="user-info" title={user.username || 'Admin'}>
              <svg className="user-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z"/>
              </svg>
              <span className="user-name">{user.username ?? '—'}</span>
            </div>
          </div>
        </header>

        <section className="admin-controls">
          <div className="search-wrap">
            <input className="search-input" placeholder="Tìm kiếm..." />
            <button className="search-btn">🔍</button>
          </div>
          <div className="add-wrap">
            <button className="add-btn" onClick={() => alert('Thêm khách hàng (placeholder)')}>Thêm khách hàng</button>
          </div>
        </section>

        <section className="admin-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tùy chỉnh</th>
                <th>Mã KH</th>
                <th>Họ tên</th>
                <th>Liên lạc</th>
                <th>Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((r, i) => (
                <tr key={r.code}>
                  <td>{i + 1}</td>
                  <td className="actions-cell">
                    <button className="icon-btn" title="Sửa">✏️</button>
                    <button className="icon-btn danger" title="Xóa">✖️</button>
                  </td>
                  <td>{r.code}</td>
                  <td>{r.name}</td>
                  <td>{r.contact}</td>
                  <td>{r.addr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
// ...existing code...