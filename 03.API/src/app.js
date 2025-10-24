
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// ================== MIDDLEWARE ==================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // đọc JSON body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================== ROUTES ==================
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount route handlers
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);

// Log registered routes
console.log('Registered routes:');
[adminRoutes, authRoutes, customerRoutes].forEach(router => {
  if (router.stack) {
    router.stack.forEach(layer => {
      if (layer.route) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods);
        console.log(`${methods.join(',').toUpperCase()} /api/admin${path}`);
      }
    });
  }
});

// ================== TRANG MẶC ĐỊNH ==================
app.get('/', (req, res) => {
  res.send('🟢 API server is running successfully!');
});

// ================== XỬ LÝ LỖI CHUNG ==================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: 'Endpoint không tồn tại!'
  });
});

// ==================== DEBUG ROUTES ==================
if (app && app._router && app._router.stack) {
  console.log('✅ Routes loaded:');
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
  });
}

// ==================== EXPORT APP ====================
module.exports = app;
