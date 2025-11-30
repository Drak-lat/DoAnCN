const express = require('express');
const router = express.Router();
const loginController = require('../controllers/auth/loginController');
const profileController = require('../controllers/auth/profileController');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Authentication routes
router.post('/login', loginController.login);

// Profile routes - dùng chung cho admin và customer
router.get('/profile', authenticateToken, profileController.getProfile);
router.put('/profile', authenticateToken, profileController.updateProfile);
router.put('/change-password', authenticateToken, profileController.changePassword);

module.exports = router;