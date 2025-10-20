const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Thêm dòng này
app.use(express.json());

// Khai báo các route ở đây:
const customerRoutes = require('./routes/customer.routes');
app.use('/api/customer', customerRoutes);

const changePasswordRouter = require('./routes/changepassword.routes');
app.use('/api/user', changePasswordRouter);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

module.exports = app;