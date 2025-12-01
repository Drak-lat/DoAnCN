const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id_message: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_sender: { type: DataTypes.INTEGER, allowNull: false },
  id_receiver: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.STRING(2000) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'messages',
  timestamps: false
});

module.exports = Message;