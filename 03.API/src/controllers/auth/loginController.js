// controllers/auth/LoginController.js
const authService = require('../../services/auth.service');
const jwt = require('jsonwebtoken');
const { Information } = require('../../models'); // ✅ Kết nối bảng Information
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // ⚠️ Kiểm tra input
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Thiếu thông tin đăng nhập'
      });
    }

    // ✅ Gọi service xác thực tài khoản
    const result = await authService.authenticate(identifier, password);
    const user = result.user || null;
    let token = result.token || null;

    // ⚠️ Nếu không có user => sai thông tin đăng nhập
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: 'Đăng nhập thất bại. Sai tài khoản hoặc mật khẩu.'
      });
    }

    // ✅ Nếu service chưa tạo token thì tự tạo
    if (!token) {
      const payload = {
        id_login: user.id_login,
        username: user.username,
        id_level: user.id_level
      };
      token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    }

    // ✅ Lấy thêm thông tin cá nhân từ bảng Information
    const info = await Information.findOne({
      where: { id_login: user.id_login }
    });

    // ✅ Gộp thông tin user với info cá nhân
    const mergedUser = {
      id_login: user.id_login,
      username: user.username,
      id_level: user.id_level,
      fullName: info?.name_information || '',
      dob: info?.date_of_birth || '',
      phone: info?.phone_information || '',
      email: info?.email || ''
    };

    // ✅ Xác định trang chuyển hướng
    const redirect =
      user.id_level === 1
        ? '/admin'
        : user.id_level === 2
        ? '/customer'
        : '/';

    // ✅ Gửi phản hồi về frontend
    return res.json({
      success: true,
      msg: 'Đăng nhập thành công',
      token,
      user: mergedUser,
      redirect
    });
  } catch (err) {
    console.error('🔥 Login error:', err);
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      msg: err.message || 'Lỗi máy chủ'
    });
  }
};
