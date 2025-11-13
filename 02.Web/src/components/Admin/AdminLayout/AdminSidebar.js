import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className={isActive('/dashboard')}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/products" className={isActive('/admin/products')}>
              <i className="fas fa-box"></i>
              <span>Sản phẩm</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className={isActive('/admin/users')}>
              <i className="fas fa-users"></i>
              <span>Khách hàng</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" className={isActive('/admin/orders')}>
              <i className="fas fa-shopping-cart"></i>
              <span>Đơn hàng</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/contacts" className={isActive('/admin/contacts')}>
              <i className="fas fa-envelope"></i>
              <span>Liên hệ</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default AdminSidebar;