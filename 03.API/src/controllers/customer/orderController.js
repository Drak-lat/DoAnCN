/* filepath: d:\DACN06\DoAnCN\03.API\src\controllers\customer\orderController.js */
const { Order, OrderDetail, Product, Cart, CartDetail, Login, Information, sequelize } = require('../../models');

// Tạo đơn hàng trực tiếp (mua ngay)
exports.createDirectOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_login } = req.user;
    const {
      receiver_name,
      receiver_phone,
      receiver_address,
      payment_method = 'COD',
      note = '',
      items, // [{ id_product, quantity, price }]
      total
    } = req.body;

    // Validate input
    if (!receiver_name || !receiver_phone || !receiver_address) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giao hàng'
      });
    }

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không có sản phẩm nào được chọn'
      });
    }

    // Kiểm tra tồn kho cho tất cả sản phẩm
    for (const item of items) {
      const product = await Product.findByPk(item.id_product, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm ID: ${item.id_product}`
        });
      }

      if (product.quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name_product}" chỉ còn ${product.quantity} trong kho`
        });
      }
    }

    // ✅ SỬA: Lưu trực tiếp "Chờ xác nhận" và "Chờ thanh toán"
    const order = await Order.create({
      id_login,
      receiver_name,
      receiver_phone,
      receiver_address,
      total,
      payment_method,
      payment_status: 'Chưa thanh toán',
      order_status: 'Chờ xác nhận', 
      date_order: new Date(),
      note
    }, { transaction });

    // Tạo chi tiết đơn hàng và trừ tồn kho
    for (const item of items) {
      await OrderDetail.create({
        id_order: order.id_order,
        id_product: item.id_product,
        quantity_detail: item.quantity,
        price_detail: item.price
      }, { transaction });

      // Trừ tồn kho
      await Product.decrement('quantity', {
        by: item.quantity,
        where: { id_product: item.id_product },
        transaction
      });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Đặt hàng thành công', 
      data: {
        id_order: order.id_order,
        order_status: order.order_status, // ✅ Trả về "Chờ xác nhận"
        total: order.total,
        date_order: order.date_order
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create direct order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Tạo đơn hàng từ giỏ hàng
exports.createOrderFromCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_login } = req.user;
    const {
      receiver_name,
      receiver_phone,
      receiver_address,
      payment_method = 'COD',
      note = '',
      cart_item_ids = [] // IDs của cart items được chọn
    } = req.body;

    // Validate input
    if (!receiver_name || !receiver_phone || !receiver_address) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin giao hàng'
      });
    }

    // Lấy cart của user
    const cart = await Cart.findOne({
      where: { id_login },
      include: [{
        model: CartDetail,
        where: cart_item_ids.length > 0 ? 
          { id_cartdetail: cart_item_ids } : {},
        include: [{
          model: Product,
          attributes: ['id_product', 'name_product', 'price', 'quantity']
        }]
      }],
      transaction
    });

    if (!cart || cart.CartDetails.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống hoặc không có sản phẩm nào được chọn'
      });
    }

    // Kiểm tra tồn kho
    let total = 0;
    for (const cartItem of cart.CartDetails) {
      const product = cartItem.Product;
      if (product.quantity < cartItem.quantitycart_detail) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name_product}" chỉ còn ${product.quantity} trong kho`
        });
      }
      total += product.price * cartItem.quantitycart_detail;
    }

    // ✅ SỬA: Lưu trực tiếp "Chờ xác nhận" và "Chờ thanh toán"
    const order = await Order.create({
      id_login,
      receiver_name,
      receiver_phone,
      receiver_address,
      total,
      payment_method,
      payment_status: 'Chưa thanh toán',
      order_status: 'Chờ xác nhận', 
      date_order: new Date(),
      note
    }, { transaction });

    // Tạo chi tiết đơn hàng và trừ tồn kho
    for (const cartItem of cart.CartDetails) {
      const product = cartItem.Product;
      
      await OrderDetail.create({
        id_order: order.id_order,
        id_product: product.id_product,
        quantity_detail: cartItem.quantitycart_detail,
        price_detail: product.price
      }, { transaction });

      // Trừ tồn kho
      await Product.decrement('quantity', {
        by: cartItem.quantitycart_detail,
        where: { id_product: product.id_product },
        transaction
      });

      // Xóa khỏi giỏ hàng
      await cartItem.destroy({ transaction });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Đặt hàng từ giỏ hàng thành công',
      data: {
        id_order: order.id_order,
        order_status: order.order_status, // ✅ Trả về "Chờ xác nhận"
        total: order.total,
        date_order: order.date_order
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create order from cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy danh sách đơn hàng của user
exports.getUserOrders = async (req, res) => {
  try {
    const { id_login } = req.user;
    const {
      page = 1,
      limit = 10,
      status = '',
      sort = 'newest'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = { id_login };
    if (status) {
      where.order_status = status;
    }

    let order = [['date_order', 'DESC']];
    if (sort === 'oldest') {
      order = [['date_order', 'ASC']];
    } else if (sort === 'price_asc') {
      order = [['total', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['total', 'DESC']];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          attributes: ['id_product', 'name_product', 'image_product']
        }]
      }]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.json({
      success: true,
      data: {
        orders, // ✅ Không cần convert, trả về trực tiếp từ DB
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id_order: orderId,
        id_login // Chỉ cho phép xem đơn hàng của mình
      },
      include: [{
        model: OrderDetail,
        include: [{
          model: Product,
          attributes: ['id_product', 'name_product', 'image_product', 'author', 'publisher']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    return res.json({
      success: true,
      data: order // ✅ Trả về trực tiếp từ DB
    });

  } catch (error) {
    console.error('Get order detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Hủy đơn hàng
/* exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_login } = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id_order: orderId,
        id_login
      },
      include: [{
        model: OrderDetail,
        include: [Product]
      }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // ✅ SỬA: Kiểm tra trạng thái tiếng Việt
    if (order.order_status !== 'Chờ xác nhận') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận'
      });
    }

    // Hoàn lại tồn kho
    for (const orderDetail of order.OrderDetails) {
      await Product.increment('quantity', {
        by: orderDetail.quantity_detail,
        where: { id_product: orderDetail.id_product },
        transaction
      });
    }

    // ✅ SỬA: Cập nhật trạng thái tiếng Việt
    await order.update({
      order_status: 'Đã hủy'
    }, { transaction });

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Hủy đơn hàng thành công'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
}; */

// Khách hàng xác nhận đã nhận hàng
exports.confirmReceived = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { 
        id_order: orderId,
        id_login 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.order_status !== 'Đã giao') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đơn hàng đã giao'
      });
    }

    await order.update({
      order_status: 'Đã nhận'
    });

    return res.json({
      success: true,
      message: 'Xác nhận đã nhận hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Confirm received error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};