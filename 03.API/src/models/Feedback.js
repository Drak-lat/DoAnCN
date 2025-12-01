const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id_feedback: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_product: { type: DataTypes.INTEGER, allowNull: false },
  id_login: { type: DataTypes.INTEGER, allowNull: false },
  id_order: { type: DataTypes.INTEGER, allowNull: false }, // ✅ THÊM
  rating: { type: DataTypes.INTEGER, defaultValue: 0 },
  comment: { type: DataTypes.STRING(1000) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  admin_reply: { type: DataTypes.STRING(1000) },
  reply_at: { type: DataTypes.DATE }
}, {
  tableName: 'feedbacks',
  timestamps: false
});

module.exports = Feedback;