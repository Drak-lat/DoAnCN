
const express = require('express');
const router = express.Router();
const { authenticateToken, checkCustomerRole } = require('../middlewares/auth.middleware');

// Import controllers
const registerController = require('../controllers/customer/registerController');
const headerCustomerController = require('../controllers/customer/headerCustomerController');
const homeController = require('../controllers/customer/homeController');
const cartController = require('../controllers/customer/cartController');
const orderController = require('../controllers/customer/orderController');
const feedbackController = require('../controllers/customer/feedbackController');
const messageController = require('../controllers/customer/messageController');
const paypalController = require('../controllers/customer/paypalController');

// Register route - KHÔNG CẦN ĐĂNG NHẬP
router.post('/register', registerController.register);

// Contact route - KHÔNG CẦN ĐĂNG NHẬP (khách hàng gửi liên hệ)
router.post('/contact', contactController.createContact); // ⭐ THÊM

// Header routes - KHÔNG CẦN ĐĂNG NHẬP
router.get('/categories', headerCustomerController.getCategories);

// ✅ THÊM: Home page products
router.get('/products', homeController.getHomeData);

router.get('/products/search', headerCustomerController.searchProducts);
router.get('/categories/:categoryId/products', headerCustomerController.getProductsByCategory);

// Product detail - YÊU CẦU ĐĂNG NHẬP
router.get('/products/:id', authenticateToken, checkCustomerRole, headerCustomerController.getProductDetail);

// Cart routes - YÊU CẦU ĐĂNG NHẬP
// ⭐ ĐẶT /cart/count TRƯỚC /cart
router.get('/cart/count', authenticateToken, checkCustomerRole, cartController.getCartCount);
router.get('/cart', authenticateToken, checkCustomerRole, cartController.getCart);
router.post('/cart', authenticateToken, checkCustomerRole, cartController.addToCart);
router.put('/cart/:id_cartdetail', authenticateToken, checkCustomerRole, cartController.updateCartItem);
router.delete('/cart/:id_cartdetail', authenticateToken, checkCustomerRole, cartController.removeFromCart);
router.delete('/cart', authenticateToken, checkCustomerRole, cartController.clearCart);

// ✅ SỬA: Order routes - Khớp với service
router.post('/orders/create-direct', authenticateToken, checkCustomerRole, orderController.createDirectOrder);
router.post('/orders/create-from-cart', authenticateToken, checkCustomerRole, orderController.createOrderFromCart);
router.get('/orders', authenticateToken, checkCustomerRole, orderController.getUserOrders);
router.get('/orders/:orderId', authenticateToken, checkCustomerRole, orderController.getOrderDetail);
router.patch('/orders/:orderId/confirm-received', authenticateToken, checkCustomerRole, orderController.confirmReceived);

// ✅ XÓA: Không còn chức năng hủy đơn
// router.patch('/orders/:orderId/cancel', authenticateToken, checkCustomerRole, orderController.cancelOrder);

// Feedback routes
router.get('/products/:productId/feedbacks', feedbackController.getProductFeedbacks); // Công khai
router.get('/my-orders-feedback', authenticateToken, checkCustomerRole, feedbackController.getMyOrdersForFeedback);
router.post('/feedbacks', authenticateToken, checkCustomerRole, feedbackController.createFeedback);
router.get('/my-feedbacks', authenticateToken, checkCustomerRole, feedbackController.getMyFeedbacks);

// Message routes
router.get('/messages', authenticateToken, checkCustomerRole, messageController.getMyMessages);
router.post('/messages', authenticateToken, checkCustomerRole, messageController.sendMessageToAdmin);

// VNPAY payment route
router.get('/create_payment', vnpayController.createPayment);
router.get('/vnpay_return', vnpayController.vnpayReturn);

router.get('/create_paypal', paypalController.createPayment);
router.get('/paypal_success', paypalController.executePayment);
router.get('/paypal_cancel', paypalController.cancelPayment);
router.get('/paypal_payment', paypalController.createPayment);   // alias cho /create_paypal





module.exports = router;

