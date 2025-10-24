// ...existing code...
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PersonalPage from "./pages/Customer/PersonalPage";
import Header from './components/Header/Header';
import Register from './pages/Shared/Register/Register';
import Login from './pages/Shared/Login/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import AdminPage from './pages/Admin/AdminPage';
import AdminInfo from './pages/Admin/AdminInfo'; // thêm import

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Home</div>} />

        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <PersonalPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute requiredLevel={1}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />

        {/* route riêng cho trang AdminInfo */}
        <Route
          path="/admin/info"
          element={
            <RoleProtectedRoute requiredLevel={1}>
              <AdminInfo />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// ...existing code...