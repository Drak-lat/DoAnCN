// src/models/Product.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

class Product extends Model {}

Product.init(
  {
    id_product: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name_product: { type: DataTypes.STRING(200), allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    image_product: { type: DataTypes.STRING(200) },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dimension: { type: DataTypes.STRING(100) },
    manufacturer: { type: DataTypes.STRING(100) },
    page: { type: DataTypes.INTEGER },
    author: { type: DataTypes.STRING(200) },
    publisher_year: { type: DataTypes.INTEGER }, // YEAR -> INT cho dễ dùng
    text_product: { type: DataTypes.STRING(500) },
    size: { type: DataTypes.STRING(100) },
    id_category: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: false,
  }
);

// Liên kết
Product.belongsTo(Category, {
  foreignKey: "id_category",
  as: "category",
});

module.exports = Product;
