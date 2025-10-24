// src/components/AdminSidebar/AdminSidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

// Import file CSS của riêng component này
import './AdminSidebar.css'; 

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      {/* Header của Sidebar */}
      <div className="sidebar-header">
        <h3>HAVANABOOK</h3>
        <h4>MANAGER</h4>
      </div>
      
      {/* Menu điều hướng */}
      <nav className="sidebar-nav">
        <ul>
          {/* Các link này tương ứng với route con trong App.js */}
          <li>
            {/* Khớp với path="books" */}
            <NavLink to="/admin/books">Quản lí sách</NavLink>
          </li>
          <li>
            <NavLink to="/admin/messages">Quản lí tin nhắn</NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders">Quản lí đơn hàng</NavLink>
          </li>
          <li>
            <NavLink to="/admin/feedback">Quản lí phản hồi</NavLink>
          </li>
          <li>
            <NavLink to="/admin/profile">Thông tin cá nhân</NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}