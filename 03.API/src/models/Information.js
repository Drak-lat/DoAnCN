const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Information = sequelize.define('Information', {
  id_information: { // Đúng tên cột khóa chính trong bảng
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name_information: DataTypes.STRING,
  phone_information: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  date_of_birth: DataTypes.DATEONLY,
  avatar: DataTypes.STRING,
  id_login: {
    type: DataTypes.INTEGER,
    unique: true
  }
}, {
  tableName: 'informations',
  freezeTableName: true,
  timestamps: false // Nếu bảng không có createdAt, updatedAt
});

module.exports = Information;