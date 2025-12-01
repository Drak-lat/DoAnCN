const { Feedback, Product, Login, Information, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Lấy danh sách sản phẩm có feedback
exports.getProductsWithFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let productWhere = {};
    if (search) {
      productWhere.name_product = { [Op.like]: `%${search}%` };
    }

    // Lấy tất cả sản phẩm có feedback
    const productsWithFeedback = await Feedback.findAll({
      attributes: [
        'id_product',
        [sequelize.fn('COUNT', sequelize.col('id_feedback')), 'feedbackCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      group: ['id_product'],
      raw: true
    });

    // Lấy thông tin chi tiết sản phẩm
    const productIds = productsWithFeedback.map(f => f.id_product);
    
    const products = await Product.findAll({
      where: {
        id_product: { [Op.in]: productIds },
        ...productWhere
      },
      attributes: ['id_product', 'name_product', 'image_product'],
      limit: parseInt(limit),
      offset
    });

    // Kết hợp dữ liệu
    const productsWithCount = products.map(product => {
      const feedbackData = productsWithFeedback.find(f => f.id_product === product.id_product);
      return {
        ...product.toJSON(),
        feedbackCount: feedbackData?.feedbackCount || 0,
        avgRating: feedbackData?.avgRating ? parseFloat(feedbackData.avgRating).toFixed(1) : '0.0'
      };
    });

    return res.json({
      success: true,
      data: productsWithCount
    });
  } catch (error) {
    console.error('Get products with feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy feedback của 1 sản phẩm
exports.getProductFeedbacksAdmin = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: { id_product: productId },
      include: [{
        model: Login,
        attributes: ['username'],
        include: [{
          model: Information,
          attributes: ['name_information', 'phone_information']
        }]
      }, {
        model: Product,
        attributes: ['name_product', 'image_product']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count
        }
      }
    });
  } catch (error) {
    console.error('Get product feedbacks admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Admin phản hồi feedback
exports.replyFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { admin_reply } = req.body;

    if (!admin_reply || admin_reply.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung phản hồi không được để trống'
      });
    }

    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    await feedback.update({
      admin_reply,
      reply_at: new Date()
    });

    return res.json({
      success: true,
      message: 'Phản hồi thành công',
      data: feedback
    });
  } catch (error) {
    console.error('Reply feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Xóa feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    await feedback.destroy();

    return res.json({
      success: true,
      message: 'Đã xóa đánh giá'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

module.exports = exports;