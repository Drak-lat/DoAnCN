const { Product, Category, OrderDetail, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Lấy chi tiết sản phẩm - YÊU CẦU ĐĂNG NHẬP KHÁCH HÀNG
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_login; // Từ authMiddleware
    const userLevel = req.user.id_level; // Từ authMiddleware
    
    console.log('🔍 Getting product detail for ID:', id);
    console.log('👤 User info:', { userId, userLevel });

    // Kiểm tra quyền user (chỉ cho phép level 2 - customer)
    if (userLevel !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần đăng nhập với tài khoản khách hàng để xem chi tiết sản phẩm'
      });
    }

    // Lấy thông tin sản phẩm kèm category
    const product = await Product.findOne({
      where: { id_product: id },
      include: [{
        model: Category,
        attributes: ['id_category', 'name_category']
      }],
      attributes: [
        'id_product',
        'name_product',
        'price',
        'image_product',
        'quantity',
        'dimension',
        'manufacturer',
        'page',
        'author',
        'publisher',
        'publisher_year',
        'text_product',
        'size',
        'id_category'
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Lấy sản phẩm liên quan (cùng danh mục)
    const relatedProducts = await Product.findAll({
      where: {
        id_category: product.id_category,
        id_product: { [Op.ne]: id },
        quantity: { [Op.gt]: 0 }
      },
      limit: 4,
      order: [['id_product', 'DESC']],
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'author',
        'publisher'
      ]
    });

    // Lấy thống kê bán hàng (nếu có)
    let salesStats = null;
    try {
      const salesData = await OrderDetail.findOne({
        where: { id_product: id },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id_order_detail')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('quantity_detail')), 'total_sold']
        ]
      });
      
      if (salesData) {
        salesStats = {
          orderCount: salesData.dataValues.order_count || 0,
          totalSold: salesData.dataValues.total_sold || 0
        };
      }
    } catch (error) {
      salesStats = null;
    }

    return res.json({
      success: true,
      data: {
        product: {
          ...product.toJSON(),
          salesStats
        },
        relatedProducts
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy đánh giá sản phẩm (để phát triển sau)
exports.getProductReviews = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        reviews: [],
        summary: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          }
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};