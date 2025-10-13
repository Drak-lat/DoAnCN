const auth = require('./auth.middleware');

module.exports = [
  auth,
  (req, res, next) => {
    if (req.user && req.user.id_level === 2) return next();
    return res.status(403).json({ success: false, msg: 'Yêu cầu quyền khách hàng' });
  }
];