const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id_product: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_product: { type: DataTypes.STRING(200), allowNull: false },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  image_product: { type: DataTypes.STRING(200) },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  dimension: { type: DataTypes.STRING(100) },
  manufacturer: { type: DataTypes.STRING(100) },
  page: { type: DataTypes.INTEGER },
  author: { type: DataTypes.STRING(100) },
  publisher: { type: DataTypes.STRING(200) },
  publisher_year: { type: DataTypes.INTEGER },
  text_product: { type: DataTypes.STRING(255) },
  size: { type: DataTypes.STRING(100) },
  id_category: { type: DataTypes.INTEGER }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;