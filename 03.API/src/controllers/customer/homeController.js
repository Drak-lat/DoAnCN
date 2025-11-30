const { Product, OrderDetail, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.testDatabase = async (req, res) => {
  try {
    const totalCount = await Product.count();
    const products = await Product.findAll({ limit: 3 });
    
    return res.json({
      success: true,
      message: 'Database test successful',
      data: {
        totalProducts: totalCount,
        sampleProducts: products
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database test failed: ' + error.message
    });
  }
};

exports.getHomeData = async (req, res) => {
  try {
    const { 
      limit = 12, 
      page = 1,
      category, 
      search, 
      sort = 'newest' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    where.quantity = { [Op.gt]: 0 };

    if (search) {
      where[Op.or] = [
        { name_product: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category && category !== 'all') {
      where.id_category = category;
    }

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
        'publisher_year',
        'text_product'
      ]
    });

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
        'text_product'
      ]
    });

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
      bestSellerProducts = bestSellerProducts.map(p => {
        const product = p.toJSON();
        product.total_sold = 0;
        return product;
      });
    }

    const totalProducts = count;
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return res.json({
      success: true,
      data: {
        products,
        featuredProducts,
        newProducts,
        bestSellerProducts,
        totalProducts,
        pagination: {
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
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};
