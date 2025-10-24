const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id_contact: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_contact: { type: DataTypes.STRING(100) },
  phone_contact: { type: DataTypes.STRING(20) },
  text_contact: { type: DataTypes.STRING(500) },
  date_contact: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'contacts',
  timestamps: false
});

module.exports = Contact;