const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id_contact: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name_contact: { 
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Tên không được để trống'
      },
      len: {
        args: [2, 100],
        msg: 'Tên phải có từ 2-100 ký tự'
      }
    }
  },
  phone_contact: { 
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Số điện thoại không được để trống'
      },
      isNumeric: {
        msg: 'Số điện thoại chỉ được chứa số'
      },
      len: {
        args: [10, 11],
        msg: 'Số điện thoại phải có 10-11 số'
      }
    }
  },
  text_contact: { 
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nội dung liên hệ không được để trống'
      },
      len: {
        args: [10, 500],
        msg: 'Nội dung phải có từ 10-500 ký tự'
      }
    }
  },
  date_contact: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: 'contacts',
  timestamps: false,
  indexes: [
    {
      fields: ['phone_contact', 'date_contact'] // Index để tìm kiếm spam nhanh hơn
    }
  ]
});

module.exports = Contact;