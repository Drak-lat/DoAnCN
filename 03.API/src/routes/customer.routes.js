// routes/customer.router.js
const express = require('express');
const router = express.Router();

const registerController = require('../controllers/customer/registerController');
const ChangeInfo = require('../controllers/customer/ChangeInfo');
const authMiddleware = require('../middlewares/auth.middleware');

// Đăng ký
router.post('/register', registerController.register);

// Lấy thông tin cá nhân
router.get('/info', authMiddleware, ChangeInfo.getInfo);

// Cập nhật thông tin cá nhân
router.put('/info', authMiddleware, ChangeInfo.updateInfo);

module.exports = router;
