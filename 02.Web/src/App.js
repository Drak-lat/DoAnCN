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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// ...existing code...