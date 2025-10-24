const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ChangeInfoAdmin = require('../controllers/admin/ChangeInfoAdmin');

// PUT /api/admin/info -> update admin's own info
router.put('/info', authMiddleware, ChangeInfoAdmin.updateAdminInfo);

module.exports = router;