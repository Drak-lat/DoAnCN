// ...existing code...
const authService = require('../../services/auth.service');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, msg: 'Thiếu thông tin đăng nhập' });
    }

    // authService.authenticate should return { user, token? }
    const result = await authService.authenticate(identifier, password);
    const user = result.user || null;
    let token = result.token || null;

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Đăng nhập thất bại' });
    }

    // If authService didn't create token, create one here (ensures id_level included)
    if (!token) {
      const payload = {
        id_login: user.id_login,
        username: user.username,
        id_level: user.id_level
      };
      token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    }

    // redirect: admin -> /admin, customer -> /customer
    const redirect = user.id_level === 1 ? '/admin' : (user.id_level === 2 ? '/customer' : '/');

    return res.json({
      success: true,
      token,
      user,
      redirect
    });
  } catch (err) {
    console.error('Login error:', err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, msg: err.message || 'Lỗi máy chủ' });
  }
};