const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, msg: 'Thiếu token' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, msg: 'Định dạng token không hợp lệ' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Token không hợp lệ hoặc hết hạn' });
  }
};

const checkCustomerRole = (req, res, next) => {
  if (req.user && req.user.id_level === 2) {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    msg: 'Yêu cầu quyền khách hàng' 
  });
};

module.exports = { authenticateToken, checkCustomerRole };