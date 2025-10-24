// src/controllers/admin/product.controller.js
const productService = require("../../services/product.service");

// GET /api/admin/products
exports.getAll = async (req, res) => {
  try {
    const { page, limit, q, categoryId } = req.query;
    const data = await productService.listProducts({ page, limit, q, categoryId });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/products/:id
exports.getOne = async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/products
exports.create = async (req, res) => {
  try {
    // Defensive: req.body may be undefined if request not parsed as form-data
    const body = req.body || {};
    console.log('Request headers for create:', req.headers);

    // Lấy dữ liệu từ form (an toàn nếu body undefined)
    const productData = {
      name_product: body.name_product,
      price: body.price,
      quantity: body.quantity,
      author: body.author || null,
      id_category: body.id_category || null,
      text_product: body.text_product || null,
      image_product: req.file ? `/uploads/${req.file.filename}` : null, // Include full path for uploaded file
      dimension: body.dimension || null,
      manufacturer: body.manufacturer || null,
      page: body.page || null,
      publisher: body.publisher || null,
      publisher_year: body.publisher_year || null,
      size: body.size || null
    };

    console.log('Creating product with data:', productData);

    const newProduct = await productService.createProduct(productData);
    res.status(201).json({ 
      success: true, 
      message: "Thêm sách thành công!",
      data: newProduct 
    });
  } catch (err) {
    console.error('Error creating product:', err);
    // If req.body was undefined, provide clearer message
    const msg = err.message || 'Lỗi khi thêm sách!';
    res.status(400).json({ 
      success: false, 
      message: msg
    });
  }
};

// PUT /api/admin/products/:id
exports.update = async (req, res) => {
  try {
    // If multipart/form-data with multer, file is in req.file and fields in req.body
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image_product = `/uploads/${req.file.filename}`;
    }

    console.log('Updating product id=', req.params.id, 'with data:', updateData);

    const updated = await productService.updateProduct(req.params.id, updateData);
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/products/:id
exports.remove = async (req, res) => {
  try {
    const ok = await productService.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
    res.json({ success: true, message: "Đã xóa sản phẩm!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
