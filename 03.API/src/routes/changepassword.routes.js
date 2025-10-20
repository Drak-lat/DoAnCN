const express = require('express');
const router = express.Router();
const { changePassword } = require('../controllers/customer/ChangePassword');

// PUT /api/user/change-password
router.put('/change-password', changePassword);

module.exports = router;