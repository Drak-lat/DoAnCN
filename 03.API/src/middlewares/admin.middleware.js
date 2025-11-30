const { authenticateToken } = require('./auth.middleware');

module.exports = (req, res, next) => {
  // Gọi auth middleware trước
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    
    // Kiểm tra quyền admin
    if (req.user && req.user.id_level === 1) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      msg: 'Yêu cầu quyền admin' 
    });
  });
};