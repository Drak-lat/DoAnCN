const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartDetail = sequelize.define('CartDetail', {
  id_cartdetail: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cart: { type: DataTypes.INTEGER, allowNull: false },
  id_product: { type: DataTypes.INTEGER, allowNull: false },
  quantitycart_detail: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'cart_details',
  timestamps: false
});

module.exports = CartDetail;