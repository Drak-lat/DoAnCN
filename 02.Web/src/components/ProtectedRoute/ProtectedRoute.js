import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredLevel }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Kiểm tra đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra tài khoản bị xóa
  if (user.id_level === 3) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền truy cập
  if (requiredLevel && user.id_level !== requiredLevel) {
    // Admin thử vào trang customer hoặc ngược lại
    if (user.id_level === 1) {
      return <Navigate to="/dashboard" replace />;
    } else if (user.id_level === 2) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;