const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Login, Information } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES = process.env.JWT_EXPIRES || '2h';

async function findLoginByIdentifier(identifier) {
  // tìm theo username trước
  let login = await Login.findOne({ where: { username: identifier } });
  if (login) return login;

  // nếu không tìm thấy, tìm trong Information theo phone hoặc email, rồi lấy login bằng id_login
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
  return login;
}

function generateToken(payload, expiresIn = TOKEN_EXPIRES) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function getUserWithInfo(id_login) {
  const login = await Login.findOne({
    where: { id_login },
    attributes: ['id_login', 'username', 'id_level', 'date_register', 'id_information']
  });
  const info = await Information.findOne({
    where: { id_login },
    attributes: ['id_information', 'name_information', 'phone_information', 'email', 'date_of_birth', 'avatar']
  });
  return { login, info };
}

async function authenticate(identifier, password) {
  // Tìm login theo identifier (username | phone | email)
  const login = await findLoginByIdentifier(identifier);

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

  const token = generateToken(payload);

  return { token, user: payload };
}

module.exports = {
  authenticate,
  findLoginByIdentifier,
  generateToken,
  verifyToken,
  getUserWithInfo
};