const { Product, Order, OrderDetail } = require('../../models');

exports.getDashboard = async (req, res) => {
  try {
    // Thống kê cơ bản
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    
    const currentTime = new Date();
    
    return res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        currentTime: currentTime.toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    // SỬA: Tạm thời trả về array rỗng để test login trước
    return res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Top products error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};