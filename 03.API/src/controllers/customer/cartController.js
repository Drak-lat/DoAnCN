/* filepath: d:\DACN06\DoAnCN\03.API\src\controllers\customer\cartController.js */
const { Cart, CartDetail, Product, sequelize } = require('../../models');

// Lấy giỏ hàng của user
exports.getCart = async (req, res) => {
  try {
    const { id_login } = req.user;

    // Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({
      where: { id_login },
      include: [{
        model: CartDetail,
        include: [{
          model: Product,
          attributes: ['id_product', 'name_product', 'price', 'image_product', 'quantity', 'author', 'publisher']
        }]
      }]
    });

    if (!cart) {
      cart = await Cart.create({ id_login });
      cart.CartDetails = [];
    }

    // Tính tổng tiền
    const totalAmount = cart.CartDetails.reduce((total, item) => {
      return total + (item.Product.price * item.quantitycart_detail);
    }, 0);

    return res.json({
      success: true,
      data: {
        cart,
        totalAmount,
        totalItems: cart.CartDetails.length
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_login } = req.user;
    const { id_product, quantity = 1 } = req.body;

    // Validate input
    if (!id_product || quantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Thông tin sản phẩm không hợp lệ'
      });
    }

    // Kiểm tra sản phẩm có tồn tại
    const product = await Product.findByPk(id_product);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra số lượng tồn kho
    if (product.quantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${product.quantity} sản phẩm trong kho`
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({
      where: { id_login },
      transaction
    });

    if (!cart) {
      cart = await Cart.create({ id_login }, { transaction });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    let cartDetail = await CartDetail.findOne({
      where: {
        id_cart: cart.id_cart,
        id_product: id_product
      },
      transaction
    });

    if (cartDetail) {
      // Cập nhật số lượng
      const newQuantity = cartDetail.quantitycart_detail + quantity;
      
      if (product.quantity < newQuantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Tổng số lượng không được vượt quá ${product.quantity}`
        });
      }

      await cartDetail.update({
        quantitycart_detail: newQuantity
      }, { transaction });
    } else {
      // Tạo mới
      cartDetail = await CartDetail.create({
        id_cart: cart.id_cart,
        id_product: id_product,
        quantitycart_detail: quantity
      }, { transaction });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: cartDetail
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { id_cartdetail } = req.params; // ✅ ĐỔI từ id thành id_cartdetail
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng không hợp lệ'
      });
    }

    // Tìm cart detail thuộc về user
    const cartDetail = await CartDetail.findOne({
      where: { id_cartdetail: id_cartdetail }, // hoặc dùng { id_cartdetail } nếu key và value trùng tên
      include: [{
        model: Cart,
        where: { id_login },
        attributes: []
      }, {
        model: Product,
        attributes: ['quantity']
      }]
    });

    if (!cartDetail) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    // Kiểm tra tồn kho
    if (cartDetail.Product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${cartDetail.Product.quantity} sản phẩm trong kho`
      });
    }

    await cartDetail.update({ quantitycart_detail: quantity });

    return res.json({
      success: true,
      message: 'Đã cập nhật số lượng sản phẩm',
      data: cartDetail
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { id_cartdetail } = req.params; // ✅ ĐỔI từ id thành id_cartdetail

    // Tìm cart detail thuộc về user
    const cartDetail = await CartDetail.findOne({
      where: { id_cartdetail: id_cartdetail },
      include: [{
        model: Cart,
        where: { id_login },
        attributes: []
      }]
    });

    if (!cartDetail) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm trong giỏ hàng'
      });
    }

    await cartDetail.destroy();

    return res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_login } = req.user;

    const cart = await Cart.findOne({
      where: { id_login }
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Xóa tất cả cart details
    await CartDetail.destroy({
      where: { id_cart: cart.id_cart },
      transaction
    });

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// ✅ THÊM: Lấy số lượng sản phẩm trong giỏ hàng
exports.getCartCount = async (req, res) => {
  try {
    const { id_login } = req.user;

    const cart = await Cart.findOne({
      where: { id_login },
      include: [{
        model: CartDetail,
        attributes: ['quantitycart_detail']
      }]
    });

    if (!cart) {
      return res.json({
        success: true,
        data: { count: 0 }
      });
    }

    const totalCount = cart.CartDetails.reduce((total, item) => {
      return total + item.quantitycart_detail;
    }, 0);

    return res.json({
      success: true,
      data: { count: totalCount }
    });

  } catch (error) {
    console.error('Get cart count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};