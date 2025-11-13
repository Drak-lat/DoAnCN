const express = require('express');
const router = express.Router();
const registerController = require('../controllers/customer/registerController');
const contactController = require('../controllers/admin/contactController');
const homeController = require('../controllers/customer/homeController');

// Existing routes
router.post('/register', registerController.register);
router.post('/contact', contactController.createContact);

// Test route
router.get('/test', homeController.testDatabase);

// Home routes
router.get('/home', homeController.getHomeData);
router.get('/product/:id', homeController.getProductDetail);

module.exports = router;