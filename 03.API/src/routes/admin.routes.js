const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middlewares/admin.middleware');
const dashboardController = require('../controllers/admin/dashboardController');

router.get('/dashboard', adminMiddleware, dashboardController.getDashboard);
router.get('/top-products', adminMiddleware, dashboardController.getTopProducts);

module.exports = router;