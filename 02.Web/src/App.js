import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Register from './pages/Shared/Register/Register';
import Login from './pages/Shared/Login/Login';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import AdminProducts from './pages/Admin/Products/AdminProducts';
import AddProduct from './pages/Admin/Products/AddProduct';
import EditProduct from './pages/Admin/Products/EditProduct';
import AdminProfile from './pages/Admin/Profile/AdminProfile';
import AdminChangePassword from './pages/Admin/Profile/AdminChangePassword';
import CustomerProfile from './pages/Customer/Profile/CustomerProfile';
import CustomerChangePassword from './pages/Customer/Profile/CustomerChangePassword';
import Home from './pages/Shared/Home/Home';
import Contact from './pages/Shared/Contact/Contact';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminUsers from './pages/Admin/Users/AdminUsers';
import AdminOrders from './pages/Admin/Orders/AdminOrders';
import AdminContacts from './pages/Admin/Contacts/AdminContacts';
import CategoryProducts from './pages/Customer/Category/CategoryProducts';
import SearchResults from './pages/Customer/Search/SearchResults';
import ProductDetail from './pages/Customer/Product/ProductDetail';
import Cart from './pages/Customer/Cart/Cart';
import Checkout from './pages/Customer/Checkout/Checkout';
import CheckoutSuccess from './pages/Customer/Checkout/CheckoutSuccess';
import CustomerOrders from './pages/Customer/Orders/CustomerOrders';
import CustomerOrderDetail from './pages/Customer/Orders/CustomerOrderDetail';
import CustomerReviews from './pages/Customer/Reviews/CustomerReviews';
import AdminFeedback from './pages/Admin/Feedback/AdminFeedback';
import FeedbackDetail from './pages/Admin/Feedback/FeedbackDetail';
import CustomerMessages from './pages/Customer/Messages/CustomerMessages'; // ✅ THÊM
import AdminMessages from './pages/Admin/Messages/AdminMessages'; // ✅ THÊM
import ForgotPassword from './pages/Shared/ForgotPassword/ForgotPassword'; // ✅ THÊM

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          {/* Shared routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ THÊM */}
          
          {/* Admin routes */}
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
          
          <Route path="/admin/products" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminProducts />
            </ProtectedRoute>
          } />

          <Route path="/admin/products/add" element={
            <ProtectedRoute requiredLevel={1}>
              <AddProduct />
            </ProtectedRoute>
          } />

          <Route path="/admin/products/edit/:id" element={
            <ProtectedRoute requiredLevel={1}>
              <EditProduct />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/orders" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminOrders />
            </ProtectedRoute>
          } />

          <Route path="/admin/contacts" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminContacts />
            </ProtectedRoute>
          } />

          <Route path="/admin/feedback" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminFeedback />
            </ProtectedRoute>
          } />

          <Route path="/admin/feedback/:productId" element={
            <ProtectedRoute requiredLevel={1}>
              <FeedbackDetail />
            </ProtectedRoute>
          } />

          {/* ✅ THÊM: Admin Messages */}
          <Route path="/admin/messages" element={
            <ProtectedRoute requiredLevel={1}>
              <AdminMessages />
            </ProtectedRoute>
          } />
          
          {/* Customer routes - YÊU CẦU ĐĂNG NHẬP */}
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
              <CustomerOrders />
            </ProtectedRoute>
          } />

          <Route path="/customer/orders/:orderId" element={
            <ProtectedRoute requiredLevel={2}>
              <CustomerOrderDetail />
            </ProtectedRoute>
          } />

          <Route path="/customer/reviews" element={
            <ProtectedRoute requiredLevel={2}>
              <CustomerReviews />
            </ProtectedRoute>
          } />

          {/* ✅ SỬA: Customer Messages - Route đúng */}
          <Route path="/messages" element={
            <ProtectedRoute requiredLevel={2}>
              <CustomerMessages />
            </ProtectedRoute>
          } />

          {/* Public category và search routes */}
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* Product Detail - YÊU CẦU ĐĂNG NHẬP VỚI QUYỀN KHÁCH HÀNG */}
          <Route path="/product/:id" element={
            <ProtectedRoute requiredLevel={2}>
              <ProductDetail />
            </ProtectedRoute>
          } />
          
          {/* Cart route */}
          <Route path="/cart" element={
            <ProtectedRoute requiredLevel={2}>
              <Cart />
            </ProtectedRoute>
          } />
          
          {/* Checkout routes */}
          <Route path="/checkout" element={
            <ProtectedRoute requiredLevel={2}>
              <Checkout />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout/success" element={
            <ProtectedRoute requiredLevel={2}>
              <CheckoutSuccess />
            </ProtectedRoute>
          } />
          
          {/* Catch all routes */}
          <Route path="*" element={
            <>
              <Header />
              <div style={{marginTop: '100px', padding: '20px'}}>
                <h2>Trang không tìm thấy</h2>
                <p>Đường dẫn này không tồn tại</p>
              </div>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;