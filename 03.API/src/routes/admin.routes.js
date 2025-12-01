const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/admin.middleware');
const dashboardController = require('../controllers/admin/dashboardController');
const productController = require('../controllers/admin/productController');
const userController = require('../controllers/admin/userController');
const orderController = require('../controllers/admin/orderController');
const contactController = require('../controllers/admin/contactController'); // Thêm import
const feedbackController = require('../controllers/admin/feedbackController'); // Thêm import
const messageController = require('../controllers/admin/messageController'); // Thêm import

// Dashboard routes
router.get('/dashboard', adminMiddleware, dashboardController.getDashboard);
router.get('/top-products', adminMiddleware, dashboardController.getTopProducts);

// Product routes
router.get('/products', adminMiddleware, productController.getAllProducts);
router.get('/products/:id', adminMiddleware, productController.getProductById);
router.post('/products', 
  adminMiddleware, 
  productController.upload.single('image'),
  productController.createProduct
);
router.put('/products/:id', 
  adminMiddleware, 
  productController.upload.single('image'),
  productController.updateProduct
);
router.delete('/products/:id', adminMiddleware, productController.deleteProduct);

// Category routes
router.get('/categories', adminMiddleware, productController.getCategories);

// User Management routes
router.get('/users', adminMiddleware, userController.getAllUsers);
router.get('/users/:id', adminMiddleware, userController.getUserById);
router.post('/users', adminMiddleware, userController.createUser);
router.delete('/users/:id', adminMiddleware, userController.deleteUser);
router.patch('/users/:id/restore', adminMiddleware, userController.restoreUser);

// Order Management routes 
router.get('/orders', adminMiddleware, orderController.getAllOrders);
router.get('/orders/statistics', adminMiddleware, orderController.getOrderStatistics);
router.get('/orders/:id', adminMiddleware, orderController.getOrderById);
router.patch('/orders/:id/status', adminMiddleware, orderController.updateOrderStatus);

// Contact Management routes
router.get('/contacts', adminMiddleware, contactController.getAllContacts);
router.get('/contacts/statistics', adminMiddleware, contactController.getContactStatistics);
router.get('/contacts/:id', adminMiddleware, contactController.getContactById);
router.delete('/contacts/:id', adminMiddleware, contactController.deleteContact);

// Feedback Management routes
router.get('/feedbacks/products', adminMiddleware, feedbackController.getProductsWithFeedback);
router.get('/feedbacks/products/:productId', adminMiddleware, feedbackController.getProductFeedbacksAdmin);
router.patch('/feedbacks/:feedbackId/reply', adminMiddleware, feedbackController.replyFeedback);
router.delete('/feedbacks/:feedbackId', adminMiddleware, feedbackController.deleteFeedback);

// Message Management routes
router.get('/messages/customers', adminMiddleware, messageController.getCustomersWithMessages);
router.get('/messages/customers/:customerId', adminMiddleware, messageController.getMessagesWithCustomer);
router.post('/messages/customers/:customerId', adminMiddleware, messageController.sendMessageToCustomer);

module.exports = router;