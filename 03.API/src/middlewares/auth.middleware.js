// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, msg: 'Thiếu token' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    return res.status(401).json({ success: false, msg: 'Định dạng token không hợp lệ' });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Chuẩn hoá id_login cho đồng nhất
    const idLogin = payload.id_login
      || payload.id
      || payload.userId
      || (payload.user && (payload.user.id_login || payload.user.id))
      || payload.sub;

    req.user = { ...payload, id_login: idLogin };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Token không hợp lệ hoặc hết hạn' });
  }
};
