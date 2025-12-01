const { Feedback, Product, Order, OrderDetail, Login, Information, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Lấy feedback của sản phẩm (công khai - không cần đăng nhập)
exports.getProductFeedbacks = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: { id_product: productId },
      include: [{
        model: Login,
        attributes: ['username'],
        include: [{
          model: Information,
          attributes: ['name_information']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Tính trung bình rating
    const avgRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
      : 0;

    return res.json({
      success: true,
      data: {
        feedbacks,
        avgRating: avgRating.toFixed(1),
        totalFeedbacks: count,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get product feedbacks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy danh sách đơn hàng của khách để feedback
exports.getMyOrdersForFeedback = async (req, res) => {
  try {
    const { id_login } = req.user;

    const orders = await Order.findAll({
      where: { 
        id_login,
        order_status: 'Đã nhận' // Chỉ những đơn đã nhận mới được feedback
      },
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          attributes: ['id_product', 'name_product', 'image_product']
        }]
      }],
      order: [['date_order', 'DESC']]
    });

    // Lấy danh sách sản phẩm đã feedback
    const feedbackedProducts = await Feedback.findAll({
      where: { id_login },
      attributes: ['id_product', 'id_order']
    });

    const feedbackMap = {};
    feedbackedProducts.forEach(f => {
      const key = `${f.id_order}_${f.id_product}`;
      feedbackMap[key] = true;
    });

    // Gắn thông tin đã feedback vào từng sản phẩm
    const ordersWithFeedbackStatus = orders.map(order => {
      const orderData = order.toJSON();
      orderData.OrderDetails = orderData.OrderDetails.map(detail => {
        const key = `${order.id_order}_${detail.id_product}`;
        return {
          ...detail,
          hasFeedback: !!feedbackMap[key]
        };
      });
      return orderData;
    });

    return res.json({
      success: true,
      data: { orders: ordersWithFeedbackStatus }
    });
  } catch (error) {
    console.error('Get orders for feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Tạo feedback mới
exports.createFeedback = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { id_product, id_order, rating, comment } = req.body;

    // Validate
    if (!id_product || !id_order || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1-5 sao'
      });
    }

    // Kiểm tra đã mua sản phẩm chưa
    const orderDetail = await OrderDetail.findOne({
      where: { id_order, id_product },
      include: [{
        model: Order,
        where: { 
          id_login,
          order_status: 'Đã nhận' 
        }
      }]
    });

    if (!orderDetail) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành'
      });
    }

    // Kiểm tra đã feedback chưa
    const existingFeedback = await Feedback.findOne({
      where: { id_login, id_product, id_order }
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi'
      });
    }

    // Tạo feedback
    const feedback = await Feedback.create({
      id_product,
      id_login,
      id_order,
      rating,
      comment,
      created_at: new Date()
    });

    return res.json({
      success: true,
      message: 'Đánh giá thành công',
      data: feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy feedback của tôi
exports.getMyFeedbacks = async (req, res) => {
  try {
    const { id_login } = req.user;

    const feedbacks = await Feedback.findAll({
      where: { id_login },
      include: [{
        model: Product,
        attributes: ['id_product', 'name_product', 'image_product']
      }],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { feedbacks }
    });
  } catch (error) {
    console.error('Get my feedbacks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

module.exports = exports;