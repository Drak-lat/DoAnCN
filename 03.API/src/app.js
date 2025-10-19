const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
const customerRoutes = require('./routes/customer.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes'); // thêm sau

// Dùng routes
app.use('/api/customer', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // thêm sau

module.exports = app;
