const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Login, Information } = require('../../models');
const { Op } = require('sequelize');
const { isValidPassword } = require('../../utils/validators');

// Lưu OTP tạm thời (trong production nên dùng Redis)
const otpStorage = new Map();

// Giới hạn số lần thử
const MAX_ATTEMPTS = 5;
const OTP_EXPIRY = 10 * 60 * 1000; // 10 phút

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier, password, verificationCode } = req.body;

    // Bước 1: Gửi OTP
    if (!verificationCode) {
      if (!identifier) {
        return res.status(400).json({ 
          success: false, 
          msg: 'Vui lòng nhập số điện thoại hoặc email!' 
        });
      }

      // Tìm user theo phone hoặc email
      const info = await Information.findOne({
        where: {
          [Op.or]: [
            { phone_information: identifier },
            { email: identifier }
          ]
        }
      });

      if (!info) {
        return res.status(404).json({ 
          success: false, 
          msg: 'Số điện thoại/Email chưa được đăng ký!' 
        });
      }

      // Tạo mã OTP 6 số
      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = await bcrypt.hash(otp, 10);

      // Lưu OTP vào storage
      otpStorage.set(identifier, {
        otp: otpHash,
        attempts: 0,
        expiresAt: Date.now() + OTP_EXPIRY,
        id_login: info.id_login
      });

      console.log(`🔐 OTP cho ${identifier}: ${otp}`); // Hiển thị trong console

      return res.status(200).json({ 
        success: true, 
        msg: `Mã xác thực đã được gửi! (Console: ${otp})`, // Giả lập gửi
        otp // Trả về để hiển thị (chỉ demo, production không làm vậy)
      });
    }

    // Bước 2: Xác thực OTP và đổi mật khẩu
    if (!identifier || !password || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Thiếu thông tin!' 
      });
    }

    const otpData = otpStorage.get(identifier);
    
    if (!otpData) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Vui lòng yêu cầu mã xác thực trước!' 
      });
    }

    // Kiểm tra hết hạn
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(identifier);
      return res.status(400).json({ 
        success: false, 
        msg: 'Mã xác thực đã hết hạn!' 
      });
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStorage.delete(identifier);
      return res.status(400).json({ 
        success: false, 
        msg: 'Bạn đã nhập sai quá nhiều lần!' 
      });
    }

    // Xác thực OTP
    const isValidOTP = await bcrypt.compare(verificationCode, otpData.otp);
    
    if (!isValidOTP) {
      otpData.attempts++;
      return res.status(400).json({ 
        success: false, 
        msg: `Mã xác thực không đúng! (Còn ${MAX_ATTEMPTS - otpData.attempts} lần thử)` 
      });
    }

    // Kiểm tra mật khẩu mới
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Mật khẩu phải có ít nhất 10 ký tự gồm chữ và số!' 
      });
    }

    // Đổi mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    await Login.update(
      { pass: hashedPassword },
      { where: { id_login: otpData.id_login } }
    );

    // Xóa OTP
    otpStorage.delete(identifier);

    return res.status(200).json({ 
      success: true, 
      msg: 'Đổi mật khẩu thành công!' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ 
      success: false, 
      msg: 'Lỗi máy chủ!' 
    });
  }
};