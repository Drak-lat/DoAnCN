const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id_order: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_login: { type: DataTypes.INTEGER, allowNull: false },
  receiver_name: { type: DataTypes.STRING(100) },
  receiver_phone: { type: DataTypes.STRING(20) },
  receiver_address: { type: DataTypes.STRING(200) },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
  date_order: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  payment_status: { type: DataTypes.STRING(50) },
  payment_method: { type: DataTypes.STRING(100) },
  order_status: { type: DataTypes.STRING(100) }
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;