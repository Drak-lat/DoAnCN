const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id_category: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_category: { type: DataTypes.STRING(100), allowNull: false }
}, {
  tableName: 'categories',
  timestamps: false
});

module.exports = Category;