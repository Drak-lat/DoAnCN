const express = require('express');
const router = express.Router();
const registerController = require('../controllers/customer/registerController');
const Product = require('../models/Product');

// Đăng ký tài khoản khách hàng
router.post('/register', registerController.register);

// 🔹 Lấy toàn bộ sản phẩm
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm' });
    }
});

// 🔹 Lấy 3 sản phẩm ngẫu nhiên (cho Hero section)
router.get('/products/random', async (req, res) => {
    try {
        const products = await Product.findAll({
            order: Product.sequelize.random(), // Sử dụng random() của Sequelize
            limit: 3
        });
        res.json(products);
    } catch (err) {
        console.error('Lỗi khi lấy sản phẩm ngẫu nhiên:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm ngẫu nhiên' });
    }
});

module.exports = router;
