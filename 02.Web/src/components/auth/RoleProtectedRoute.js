import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromToken, isAuthenticated } from '../../utils/auth';

export default function RoleProtectedRoute({ children, requiredLevel }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const user = getUserFromToken();
  const level = user?.id_level ?? user?.level ?? user?.role;
  if (requiredLevel != null && level !== requiredLevel) {
    return <Navigate to="/login" replace />;
  }
  return children;
}