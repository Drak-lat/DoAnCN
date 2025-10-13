import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Register from './pages/Shared/Register/Register';
import Login from './pages/Shared/Login/Login';

function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home</div>} />
          {/* Thêm các route khác nếu cần */}
        </Routes>
      </BrowserRouter>
    </>
  );
}


export default App;