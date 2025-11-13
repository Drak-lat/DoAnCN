import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faUsers, 
  faBoxes, 
  faShoppingBag,
  faCommentDots,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import './AdminSidebar.css';

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: faTachometerAlt, label: 'Dashboard' },
    { path: '/admin/users', icon: faUsers, label: 'Quản lý người dùng' },
    { path: '/admin/products', icon: faBoxes, label: 'Quản lý sản phẩm' },
    { path: '/admin/orders', icon: faShoppingBag, label: 'Quản lý đơn hàng' },
    { path: '/admin/feedback', icon: faCommentDots, label: 'Quản lý phản hồi' },
    { path: '/admin/contacts', icon: faEnvelope, label: 'Quản lý liên hệ' } // ✅ SỬA: contact → contacts
  ];

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;