const bcrypt = require('bcryptjs');
const { Login, Information } = require('../../models');
const { isValidPassword, isGmail, isPhone10 } = require('../../utils/validators');

exports.register = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, msg: 'Tên đăng nhập và mật khẩu là bắt buộc!' });
    }

    if (phone && !isPhone10(phone)) {
      return res.status(400).json({ success: false, msg: 'Số điện thoại không hợp lệ!' });
    }

    if (email && !isGmail(email)) {
      return res.status(400).json({ success: false, msg: 'Email không hợp lệ (cần gmail)!' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, msg: 'Mật khẩu phải có ít nhất 10 ký tự gồm chữ và số.' });
    }

    const existUsername = await Login.findOne({ where: { username } });
    if (existUsername) return res.status(400).json({ success: false, msg: 'Tên đăng nhập đã tồn tại!' });

    if (phone) {
      const existPhone = await Information.findOne({ where: { phone_information: phone } });
      if (existPhone) return res.status(400).json({ success: false, msg: 'Số điện thoại đã tồn tại!' });
    }

    if (email) {
      const existEmail = await Information.findOne({ where: { email } });
      if (existEmail) return res.status(400).json({ success: false, msg: 'Email đã tồn tại!' });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const loginDoc = await Login.create({
      username,
      pass: hashedPass,
      id_level: 2
    });

    await Information.create({
      phone_information: phone || null,
      email: email || null,
      id_login: loginDoc.id_login
    });

    return res.status(201).json({ success: true, msg: 'Đăng ký thành công.' });
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'SequelizeUniqueConstraintError' && Array.isArray(error.errors) && error.errors.length) {
      const field = error.errors[0].path || '';
      const map = {
        username: 'Tên đăng nhập đã tồn tại!',
        phone_information: 'Số điện thoại đã tồn tại!',
        email: 'Email đã tồn tại!'
      };
      return res.status(400).json({ success: false, msg: map[field] || 'Dữ liệu đã tồn tại!' });
    }
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};