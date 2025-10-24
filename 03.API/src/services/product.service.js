// src/services/product.service.js
const { Op } = require("sequelize");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Danh sách sản phẩm (phân trang + tìm kiếm + lọc theo danh mục)
async function listProducts({ page = 1, limit = 10, q = "", categoryId }) {
  const where = {};
  if (q) where.name_product = { [Op.like]: `%${q}%` };
  if (categoryId) where.id_category = categoryId;

  const offset = (page - 1) * limit;
  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: "category", attributes: ["id_category", "name_category"] }],
    offset,
    limit: Number(limit),
    order: [["id_product", "DESC"]],
  });

  return {
    items: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

async function getProduct(id) {
  return await Product.findByPk(id, {
    include: [{ model: Category, as: "category", attributes: ["id_category", "name_category"] }],
  });
}

async function createProduct(data) {
  // Kiểm tra các trường bắt buộc
  if (!data.name_product) throw new Error("Tên sách không được để trống!");
  if (!data.price) throw new Error("Giá sách không được để trống!");
  if (!data.quantity) throw new Error("Số lượng không được để trống!");

  // Tạo object với các trường bắt buộc
  const productData = {
    name_product: data.name_product,
    price: Number(data.price),
    quantity: Number(data.quantity),
    // Các trường không bắt buộc, cho phép null
    author: data.author || null,
    id_category: data.id_category ? Number(data.id_category) : null,
    text_product: data.text_product || null,
    image_product: data.image_product || null,
    dimension: data.dimension || null,
    manufacturer: data.manufacturer || null,
    page: data.page ? Number(data.page) : null,
    publisher: data.publisher || null,
    publisher_year: data.publisher_year ? Number(data.publisher_year) : null,
    size: data.size || null
  };

  return await Product.create(productData);
}

async function updateProduct(id, data) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.update(data);
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return true;
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
