const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Login, Information } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function authenticate(identifier, password) {
  // Tìm theo username - SỬA: bỏ alias 'information'
  let login = await Login.findOne({ 
    where: { username: identifier },
    include: [{
      model: Information
      // Bỏ as: 'information' vì không có alias
    }]
  });

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
      login = await Login.findOne({ 
        where: { id_login: info.id_login },
        include: [{
          model: Information
          // Bỏ as: 'information'
        }]
      });
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

  // KIỂM TRA LEVEL 3 - tài khoản bị xóa
  const level = login.id_level;
  if (level === 3) {
    const err = new Error('Tài khoản đã bị xóa hoặc không có quyền truy cập');
    err.status = 403;
    throw err;
  }

  const payload = {
    id_login: login.id_login,
    username: login.username,
    id_level: login.id_level
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

  const user = {
    id_login: login.id_login,
    username: login.username,
    id_level: login.id_level,
    date_register: login.date_register,
    information: login.Information
  };

  return { token, user };
}

module.exports = { authenticate };