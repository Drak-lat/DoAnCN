// ...existing code...
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Login } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function changePassword(req, res) {
  try {
    console.log('[ChangePassword] incoming request', {
      headers: req.headers,
      body: req.body
    });

    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      console.log('[ChangePassword] no token provided');
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log('[ChangePassword] token verify failed:', err.message);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    console.log('[ChangePassword] token payload:', payload);

    // payload may contain id_login or id; accept both
    const id_login = payload.id_login || payload.id;
    if (!id_login) {
      console.log('[ChangePassword] token missing user id');
      return res.status(401).json({ message: 'Token thiếu thông tin người dùng' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng gửi mật khẩu cũ và mật khẩu mới' });
    }

    // Try find by id_login, fallback to id
    let login = await Login.findOne({ where: { id_login } });
    if (!login) {
      login = await Login.findOne({ where: { id: id_login } });
    }

    if (!login) {
      console.log('[ChangePassword] user not found for id:', id_login);
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (!login.pass) {
      console.log('[ChangePassword] user has no pass field or empty');
      return res.status(500).json({ message: 'Dữ liệu mật khẩu không hợp lệ' });
    }

    const match = await bcrypt.compare(oldPassword, login.pass);
    if (!match) {
      console.log('[ChangePassword] old password does not match');
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const sameAsOld = await bcrypt.compare(newPassword, login.pass);
    if (sameAsOld) {
      console.log('[ChangePassword] new password equals old password');
      return res.status(400).json({ message: 'Mật khẩu mới không được trùng mật khẩu cũ' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    login.pass = hashed;
    await login.save();

    console.log('[ChangePassword] password updated for user id:', id_login);
    return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    return res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
  }
}

module.exports = { changePassword };
// ...existing code...