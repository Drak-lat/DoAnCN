import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Register from './pages/Shared/Register/Register';
import Login from './pages/Shared/Login/Login';
import Dashboard from './pages/Admin/Dashboard/Dashboard';

// Admin Profile Pages
import AdminProfile from './pages/Admin/Profile/AdminProfile';
import AdminChangePassword from './pages/Admin/Profile/AdminChangePassword';

// Customer Profile Pages  
import CustomerProfile from './pages/Customer/Profile/CustomerProfile';
import CustomerChangePassword from './pages/Customer/Profile/CustomerChangePassword';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes - yêu cầu level = 1 */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredLevel={1}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/profile" element={
          <ProtectedRoute requiredLevel={1}>
            <AdminProfile />
          </ProtectedRoute>
        } />

        <Route path="/admin/change-password" element={
          <ProtectedRoute requiredLevel={1}>
            <AdminChangePassword />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute requiredLevel={1}>
            <div>Quản lý người dùng</div>
          </ProtectedRoute>
        } />
        
        {/* ... các route admin khác ... */}

        {/* Customer routes - yêu cầu level = 2 */}
        <Route path="/customer/profile" element={
          <ProtectedRoute requiredLevel={2}>
            <CustomerProfile />
          </ProtectedRoute>
        } />

        <Route path="/customer/change-password" element={
          <ProtectedRoute requiredLevel={2}>
            <CustomerChangePassword />
          </ProtectedRoute>
        } />

        <Route path="/customer/orders" element={
          <ProtectedRoute requiredLevel={2}>
            <>
              <Header />
              <div style={{marginTop: '100px', padding: '20px'}}>
                <h2>Đơn hàng của tôi</h2>
                <p>Trang đơn hàng sẽ được phát triển sau</p>
              </div>
            </>
          </ProtectedRoute>
        } />

        <Route path="/customer/reviews" element={
          <ProtectedRoute requiredLevel={2}>
            <>
              <Header />
              <div style={{marginTop: '100px', padding: '20px'}}>
                <h2>Nhận xét của tôi</h2>
                <p>Trang nhận xét sẽ được phát triển sau</p>
              </div>
            </>
          </ProtectedRoute>
        } />
        
        {/* Trang chủ với Header */}
        <Route path="/" element={
          <>
            <Header />
            <div style={{marginTop: '100px', padding: '20px'}}>
              <h2>Trang chủ - Chào mừng!</h2>
              <p>Bạn đang ở trang chủ</p>
            </div>
          </>
        } />
        
        {/* Catch all routes */}
        <Route path="*" element={
          <>
            <Header />
            <div style={{marginTop: '100px', padding: '20px'}}>
              <h2>Trang không tìm thấy</h2>
              <p>Đường dẫn này không tồn tại</p>
            </div>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;