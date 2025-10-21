const express = require('express');
const router = express.Router();
const loginController = require('../controllers/auth/loginController');
const forgotPasswordController = require('../controllers/auth/ForgotPasswordController');

router.post('/login', loginController.login);
router.post('/forgot-password', forgotPasswordController.forgotPassword);

module.exports = router;