const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Login = sequelize.define('Login', {
  id_login: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_register: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_information: {
    type: DataTypes.INTEGER,
    allowNull: true // CỘT NÀY LUÔN NULL TRONG DB
  },
  id_level: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  }
}, {
  tableName: 'login',
  freezeTableName: true,
  timestamps: false
});

module.exports = Login;