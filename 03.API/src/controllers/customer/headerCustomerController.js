const { Category, Product, sequelize } = require('../../models');
const { Op } = require('sequelize');

// ✅ THÊM: getProducts function bị thiếu
exports.getProducts = async (req, res) => {
  try {
    const { 
      limit = 12, 
      page = 1, 
      sort = 'newest',
      category = '',
      search = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      quantity: { [Op.gt]: 0 }
    };

    // Tìm kiếm
    if (search) {
      where[Op.or] = [
        { name_product: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { publisher: { [Op.like]: `%${search}%` } }
      ];
    }

    // Lọc theo danh mục
    if (category) {
      where.id_category = category;
    }

    // Sắp xếp
    let order = [['id_product', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name_product', 'ASC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
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
        'author',
        'publisher',
        'publisher_year',
        'text_product'
      ]
    });

    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);

    return res.json({
      success: true,
      data: {
        products,
        totalProducts: count,
        pagination: {
          currentPage,
          totalPages,
          totalProducts: count,
          limit: parseInt(limit),
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id_category', 'name_category'],
      order: [['name_category', 'ASC']]
    });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      limit = 12, 
      page = 1, 
      sort = 'newest' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    const where = {
      id_category: categoryId,
      quantity: { [Op.gt]: 0 }
    };

    let order = [['id_product', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name_product', 'ASC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'quantity',
        'author',
        'publisher',
        'publisher_year'
      ]
    });

    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const currentPage = parseInt(page);

    return res.json({
      success: true,
      data: {
        category,
        products,
        totalProducts,
        pagination: {
          currentPage,
          totalPages,
          totalProducts,
          limit: parseInt(limit),
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { 
      q: query, 
      limit = 12, 
      page = 1, 
      sort = 'newest' 
    } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm không được để trống'
      });
    }

    const searchTerm = query.trim();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      quantity: { [Op.gt]: 0 },
      [Op.or]: [
        { name_product: { [Op.like]: `%${searchTerm}%` } },
        { author: { [Op.like]: `%${searchTerm}%` } },
        { publisher: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    let order = [['id_product', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name_product', 'ASC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'quantity',
        'author',
        'publisher',
        'publisher_year'
      ]
    });

    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const currentPage = parseInt(page);

    return res.json({
      success: true,
      data: {
        query: searchTerm,
        products,
        totalProducts,
        pagination: {
          currentPage,
          totalPages,
          totalProducts,
          limit: parseInt(limit),
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// ✅ THÊM: getProductDetail function
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_login;
    const userLevel = req.user.id_level;
    
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

    return res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Get product detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};