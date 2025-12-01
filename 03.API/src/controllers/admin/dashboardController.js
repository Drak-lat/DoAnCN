const { Product, Order, OrderDetail } = require('../../models');
const { Sequelize } = require('sequelize');

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
    // Lấy top 10 sản phẩm bán chạy nhất từ order_details
    const topProducts = await OrderDetail.findAll({
      attributes: [
        'id_product',
        [Sequelize.fn('SUM', Sequelize.col('quantity_detail')), 'total_sold']
      ],
      include: [{
        model: Product,
        attributes: ['id_product', 'name_product', 'price', 'image_product'],
        required: true  // Chỉ lấy sản phẩm còn tồn tại
      }],
      group: ['id_product', 'Product.id_product', 'Product.name_product', 'Product.price', 'Product.image_product'],
      order: [[Sequelize.literal('total_sold'), 'DESC']],
      limit: 10
    });

    // Format lại data để frontend dễ đọc
    const formattedData = topProducts.map(item => ({
      id_product: item.id_product,
      total_sold: item.dataValues.total_sold,
      Product: {
        id_product: item.Product.id_product,
        name_product: item.Product.name_product,
        price: item.Product.price,
        image_product: item.Product.image_product
      }
    }));

    return res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Top products error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};