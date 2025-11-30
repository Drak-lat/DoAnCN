const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();


app.use(cors({
  origin: '*', // Cho phép tất cả origins (chỉ để test)
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
const customerRoutes = require('./routes/customer.routes');
app.use('/api/customer', customerRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

module.exports = app;