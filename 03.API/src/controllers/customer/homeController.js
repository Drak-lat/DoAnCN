const { Product, OrderDetail, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Thêm function test này
exports.testDatabase = async (req, res) => {
  try {
    console.log('🔍 Testing database...');
    
    const totalCount = await Product.count();
    const products = await Product.findAll({ limit: 3 });
    
    console.log(`📊 Total products: ${totalCount}`);
    console.log(`📦 Sample products:`, products.map(p => p.name_product));
    
    return res.json({
      success: true,
      message: 'Database test successful',
      data: {
        totalProducts: totalCount,
        sampleProducts: products
      }
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database test failed: ' + error.message
    });
  }
};

// Lấy sản phẩm cho trang chủ
exports.getHomeData = async (req, res) => {
  try {
    console.log('🔍 Getting home data with params:', req.query);
    
    const { 
      limit = 12, 
      page = 1,  // ✅ THÊM: tham số trang
      category, 
      search, 
      sort = 'newest' 
    } = req.query;

    // ✅ THÊM: Tính offset cho pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Điều kiện where
    const where = {};
    
    // Chỉ lấy sản phẩm có số lượng > 0
    where.quantity = { [Op.gt]: 0 };

    // Tìm kiếm theo tên sản phẩm hoặc tác giả
    if (search) {
      where[Op.or] = [
        { name_product: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    // Lọc theo danh mục
    if (category && category !== 'all') {
      where.id_category = category;
    }

    // Sắp xếp
    let order = [['id_product', 'DESC']]; // Mặc định: mới nhất
    
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'name') {
      order = [['name_product', 'ASC']];
    }

    console.log('🔍 Where conditions:', where);
    console.log('🔍 Order by:', order);
    console.log('🔍 Pagination:', { limit: parseInt(limit), offset });

    // ✅ SỬA: Đảm bảo lấy text_product trong attributes
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
        'publisher_year',
        'text_product'  // ✅ THÊM: text_product để có mô tả
      ]
    });

    // Lấy sản phẩm nổi bật (featured) với text_product
    const featuredProducts = await Product.findAll({
      where: { quantity: { [Op.gt]: 0 } },
      limit: 8,
      order: [['price', 'DESC']],
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'author',
        'text_product'  // ✅ THÊM: để có mô tả cho hero
      ]
    });

    // Lấy sản phẩm mới nhất
    const newProducts = await Product.findAll({
      where: { quantity: { [Op.gt]: 0 } },
      limit: 8,
      order: [['id_product', 'DESC']],
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'author'
      ]
    });

    // Best Seller - lấy 8 sản phẩm bán chạy từ order_details
    let bestSellerProducts = [];
    try {
      bestSellerProducts = await Product.findAll({
        include: [{
          model: OrderDetail,
          attributes: [],
          required: true
        }],
        attributes: [
          'id_product',
          'name_product', 
          'price',
          'image_product',
          'author',
          [sequelize.fn('SUM', sequelize.col('OrderDetails.quantity_detail')), 'total_sold']
        ],
        group: ['Product.id_product'],
        order: [[sequelize.literal('total_sold'), 'DESC']],
        limit: 8,
        subQuery: false
      });
    } catch (error) {
      console.warn('⚠️ Best seller query failed, using fallback:', error.message);
      // Fallback: lấy 8 sản phẩm random nếu không có order_details
      bestSellerProducts = await Product.findAll({
        where: { quantity: { [Op.gt]: 0 } },
        limit: 8,
        order: sequelize.literal('RAND()'),
        attributes: [
          'id_product',
          'name_product', 
          'price',
          'image_product',
          'author'
        ]
      });
      // Thêm total_sold = 0 cho fallback data
      bestSellerProducts = bestSellerProducts.map(p => {
        const product = p.toJSON();
        product.total_sold = 0;
        return product;
      });
    }

    // ✅ THÊM: Tính toán thông tin pagination
    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    console.log('✅ Returning data:', {
      productsCount: products.length,
      featuredCount: featuredProducts.length,
      newCount: newProducts.length,
      bestSellerCount: bestSellerProducts.length,
      totalProducts,
      totalPages,
      currentPage
    });

    return res.json({
      success: true,
      data: {
        products,
        featuredProducts,
        newProducts,
        bestSellerProducts,
        totalProducts,
        pagination: {  // ✅ THÊM: thông tin pagination
          currentPage,
          totalPages,
          totalProducts,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        currentParams: {
          limit: parseInt(limit),
          page: currentPage,
          category,
          search,
          sort
        }
      }
    });

  } catch (error) {
    console.error('❌ Get home data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting product detail for ID:', id);

    const product = await Product.findByPk(id);

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
        id_product: { [Op.ne]: id }, // Loại trừ sản phẩm hiện tại
        quantity: { [Op.gt]: 0 }
      },
      limit: 4,
      order: [['id_product', 'DESC']],
      attributes: [
        'id_product',
        'name_product', 
        'price',
        'image_product',
        'author'
      ]
    });

    console.log('✅ Found product:', product.name_product);

    return res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('❌ Get product detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};