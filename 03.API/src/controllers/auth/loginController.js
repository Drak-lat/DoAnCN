const authService = require('../../services/auth.service');

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, msg: 'Thiếu thông tin đăng nhập' });
    }

    const { token, user } = await authService.authenticate(identifier, password);

    // Xử lý redirect theo level
    let redirectTo = '/';
    if (user.id_level === 1) {
      redirectTo = '/dashboard'; // ✅ Admin → /dashboard
    } else if (user.id_level === 2) {
      redirectTo = '/'; // ✅ Customer → trang chủ
    }

    console.log('User level:', user.id_level, 'Redirect to:', redirectTo); // DEBUG

    return res.json({
      success: true,
      token,
      user,
      redirectTo
    });
  } catch (err) {
    console.error('Login error:', err);
    const status = err.status || 500;
    return res.status(status).json({ success: false, msg: err.message || 'Lỗi máy chủ' });
  }
};