const { Order, OrderDetail, Product, Login, Information } = require('../../models');
const { Op } = require('sequelize');

// Lấy danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', payment_status = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Lọc theo trạng thái đơn hàng
    if (status) {
      where.order_status = status;
    }
    
    // Lọc theo trạng thái thanh toán
    if (payment_status) {
      where.payment_status = payment_status;
    }

    // Tìm kiếm theo tên người nhận
    if (search) {
      where[Op.or] = [
        { receiver_name: { [Op.like]: `%${search}%` } },
        { receiver_phone: { [Op.like]: `%${search}%` } },
        { id_order: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Login,
          attributes: ['username'],
          required: false
        }
      ],
      attributes: [
        'id_order', 'receiver_name', 'receiver_phone', 'total', 
        'date_order', 'order_status', 'payment_status', 'id_login'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_order', 'DESC']],
      distinct: true
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ: ' + error.message 
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Login,
          attributes: ['username'],
          required: false
        },
        {
          model: OrderDetail,
          include: [
            {
              model: Product,
              attributes: ['name_product', 'price'],
              required: false
            }
          ],
          required: false
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ: ' + error.message 
    });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    await order.update(updateData);

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Thống kê đơn hàng
exports.getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { order_status: 'Chờ xác nhận' } });
    const completedOrders = await Order.count({ where: { order_status: 'Đã giao' } });
    
    const totalRevenue = await Order.sum('total', { 
      where: { 
        order_status: 'Đã giao',
        payment_status: 'Đã thanh toán'
      } 
    });

    return res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue || 0
      }
    });
  } catch (error) {
    console.error('Order statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};