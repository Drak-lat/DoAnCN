const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccessLevel = sequelize.define('AccessLevel', {
  id_level: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_level: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'access_levels', // Hoặc tên bảng thực tế của bạn
  freezeTableName: true,
  timestamps: false
});

module.exports = AccessLevel;