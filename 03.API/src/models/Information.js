const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Information = sequelize.define('Information', {
  id_information: {
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
  date_of_birth: DataTypes.DATE,
  avatar: DataTypes.STRING,
  id_login: {
    type: DataTypes.INTEGER,
    allowNull: true, // CHO PHÉP NULL
    references: {
      model: 'login',
      key: 'id_login'
    }
  }
}, {
  tableName: 'informations',
  freezeTableName: true,
  timestamps: false // Nếu bảng không có createdAt, updatedAt
});

module.exports = Information;