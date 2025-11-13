const { Product, Category } = require('../../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.upload = upload;

// Lấy tất cả sản phẩm với phân trang và tìm kiếm
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Tìm kiếm theo tên
    if (search) {
      where.name_product = {
        [require('sequelize').Op.like]: `%${search}%`
      };
    }
    
    // Lọc theo danh mục
    if (category) {
      where.id_category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        attributes: ['id_category', 'name_category']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id_product', 'ASC']] // ✅ Sắp xếp theo id_product tăng dần
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
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        attributes: ['id_category', 'name_category']
      }]
    });

    if (!product) {
      return res.status(404).json({ success: false, msg: 'Không tìm thấy sản phẩm' });
    }

    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name_product, price, quantity, dimension, manufacturer,
      page, author, publisher, publisher_year, text_product, size, id_category
    } = req.body;

    const product = await Product.create({
      name_product,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      dimension,
      manufacturer,
      page: page ? parseInt(page) : null,
      author,
      publisher,
      publisher_year: publisher_year ? parseInt(publisher_year) : null,
      text_product,
      size,
      id_category: parseInt(id_category),
      image_product: req.file ? req.file.filename : null
    });

    const newProduct = await Product.findByPk(product.id_product, {
      include: [{ model: Category, attributes: ['id_category', 'name_category'] }]
    });

    return res.json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, msg: 'Không tìm thấy sản phẩm' });

    const {
      name_product, price, quantity, dimension, manufacturer,
      page, author, publisher, publisher_year, text_product, size, id_category
    } = req.body;

    // Nếu upload file mới - xóa file cũ
    if (req.file && product.image_product) {
      const oldPath = path.join(__dirname, '../../uploads/products', product.image_product);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (err) { console.warn('Xóa ảnh cũ lỗi:', err); }
      }
    }

    await product.update({
      name_product: name_product ?? product.name_product,
      price: price !== undefined ? parseFloat(price) : product.price,
      quantity: quantity !== undefined ? parseInt(quantity) : product.quantity,
      dimension: dimension ?? product.dimension,
      manufacturer: manufacturer ?? product.manufacturer,
      page: page ? parseInt(page) : product.page,
      author: author ?? product.author,
      publisher: publisher ?? product.publisher,
      publisher_year: publisher_year ? parseInt(publisher_year) : product.publisher_year,
      text_product: text_product ?? product.text_product,
      size: size ?? product.size,
      id_category: id_category ? parseInt(id_category) : product.id_category,
      image_product: req.file ? req.file.filename : product.image_product
    });

    const updated = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id_category', 'name_category'] }]
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi khi cập nhật sản phẩm' });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, msg: 'Không tìm thấy sản phẩm' });
    }

    await product.destroy();
    
    return res.json({
      success: true,
      msg: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name_category', 'ASC']]
    });

    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};