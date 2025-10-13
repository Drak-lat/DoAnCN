const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id_cart: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_login: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'carts',
  timestamps: false
});

module.exports = Cart;