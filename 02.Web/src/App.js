import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Register from './pages/Shared/Register/Register';
import Login from './pages/Shared/Login/Login';
import ForgotPassword from './pages/Shared/ForgotPassword/ForgotPassword'; 

function App() {
  return (
    <>
      <Header /> 
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
      </>
  );
}

export default App;