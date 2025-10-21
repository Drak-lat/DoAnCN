const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Login = require('../../models/Login');
const Information = require('../../models/Information');

const otpStore = new Map();

// Xóa OTP hết hạn mỗi phút
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
}, 60000);

// Hàm sinh OTP 6 số
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function findUser(identifier) {
  if (!identifier) return null;
  let user = await Login.findOne({ where: { username: identifier } });
  if (user) return user;
  const info = await Information.findOne({ where: { email: identifier } });
  if (info) return await Login.findOne({ where: { id_login: info.id_login } });
  return null;
}

async function forgotPassword(req, res) {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, msg: 'Thiếu identifier' });
    }

    // Bước 1: Gửi OTP (giả lập trả về)
    if (!otp && !newPassword) {
      const user = await findUser(identifier);
      if (!user) {
        // Privacy: không tiết lộ user tồn tại
        return res.json({ success: true, msg: 'Nếu tồn tại, OTP đã gửi.' });
      }

      const code = generateOtp();
      const hash = await bcrypt.hash(code, 10);
      otpStore.set(user.id_login, { hash, expiresAt: Date.now() + 600_000, attempts: 0 });

      try {
        // Nếu muốn gửi email thực, thêm logic tại đây
        // await sendResetEmail(user.email, code);
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message, emailErr.stack);
        // Có thể trả về thông báo lỗi gửi email nếu cần
      }

      // Trả về OTP cho UI (giả lập)
      const info = await Information.findOne({ where: { id_login: user.id_login } });
      if (info && info.email) {
        return res.json({ success: true, type: 'email', otp: code, msg: 'OTP đã gửi về email.' });
      }
      return res.json({ success: true, type: 'phone', otp: code, msg: 'OTP đã gửi về SIM.' });
    }

    // Bước 2: Xác nhận OTP và đổi mật khẩu
    if (otp && newPassword) {
      const user = await findUser(identifier);
      if (!user) return res.status(404).json({ success: false, msg: 'Không tìm thấy user' });

      const entry = otpStore.get(user.id_login);
      if (!entry || entry.expiresAt < Date.now()) return res.status(400).json({ success: false, msg: 'OTP hết hạn' });
      if (entry.attempts >= 5) return res.status(429).json({ success: false, msg: 'Quá nhiều lần thử' });

      const ok = await bcrypt.compare(otp, entry.hash);
      if (!ok) {
        entry.attempts++;
        otpStore.set(user.id_login, entry);
        return res.status(400).json({ success: false, msg: 'OTP không đúng' });
      }

      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return res.status(400).json({ success: false, msg: 'Mật khẩu chưa đủ mạnh' });
      }

      user.pass = await bcrypt.hash(newPassword, 12);
      await user.save();
      otpStore.delete(user.id_login);
      return res.json({ success: true, msg: 'Đổi mật khẩu thành công.' });
    }

    return res.status(400).json({ success: false, msg: 'Thiếu thông tin' });
  } catch (err) {
    console.error('Error in forgot-password:', err.message, err.stack);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
}

module.exports = { forgotPassword };