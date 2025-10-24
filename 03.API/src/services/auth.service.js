const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Login, Information } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function authenticate(identifier, password) {
  // Tìm theo username
  let login = await Login.findOne({ where: { username: identifier } });

  // Nếu không tìm thấy, tìm theo phone/email trong Information
  if (!login) {
    const info = await Information.findOne({
      where: {
        [Op.or]: [
          { phone_information: identifier },
          { email: identifier }
        ]
      }
    });
    if (info) {
      login = await Login.findOne({ where: { id_login: info.id_login } });
    }
  }

  if (!login) {
    const err = new Error('Tên đăng nhập / số điện thoại / email không tồn tại');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, login.pass);
  if (!match) {
    const err = new Error('Mật khẩu không đúng');
    err.status = 401;
    throw err;
  }

  const level = login.id_level;
  if (level === 3) {
    const err = new Error('Tài khoản không có quyền truy cập');
    err.status = 403;
    throw err;
  }

  const payload = {
    id_login: login.id_login,
    username: login.username,
    id_level: login.id_level
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

  return { token, user: payload };
}

module.exports = { authenticate };