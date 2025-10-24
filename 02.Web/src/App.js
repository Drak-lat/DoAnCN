import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Register from "./pages/Shared/Register/Register";
import Login from "./pages/Shared/Login/Login";
import AdminLayout from "./pages/Admin/AdminLayout";
import ManageBooks from "./pages/Admin/ManageBooks";
import AddEditBook from "./pages/Admin/AddEditBook"; // ✅ đổi tên cho đúng file

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Các route của khách hàng === */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* === Khu vực ADMIN === */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* ✅ Các route con KHÔNG có /admin ở đầu */}
          <Route path="books" element={<ManageBooks />} />
          <Route path="books/add" element={<AddEditBook />} />
          <Route path="books/edit/:id" element={<AddEditBook />} />
        </Route>

        {/* Trang chủ tạm thời */}
        <Route path="/" element={<Header />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
