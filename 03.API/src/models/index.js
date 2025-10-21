const AccessLevel = require('./AccessLevel');
const Category = require('./Category');
const Login = require('./Login');
const Information = require('./Information');
const Product = require('./Product');
const Cart = require('./Cart');
const CartDetail = require('./CartDetail');
const Contact = require('./Contact');
const Feedback = require('./Feedback');
const Message = require('./Message');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
// ForgotPassword model removed; OTP fields are stored on Login model now

// AccessLevel - Login
AccessLevel.hasMany(Login, { foreignKey: 'id_level' });
Login.belongsTo(AccessLevel, { foreignKey: 'id_level' });

// Login - Information (1-1)
Login.hasOne(Information, { foreignKey: 'id_login' });
Information.belongsTo(Login, { foreignKey: 'id_login' });

// Login - Cart (1-n)
Login.hasMany(Cart, { foreignKey: 'id_login' });
Cart.belongsTo(Login, { foreignKey: 'id_login' });

// Cart - CartDetail (1-n)
Cart.hasMany(CartDetail, { foreignKey: 'id_cart' });
CartDetail.belongsTo(Cart, { foreignKey: 'id_cart' });

// Product - CartDetail (1-n)
Product.hasMany(CartDetail, { foreignKey: 'id_product' });
CartDetail.belongsTo(Product, { foreignKey: 'id_product' });

// Category - Product (1-n)
Category.hasMany(Product, { foreignKey: 'id_category' });
Product.belongsTo(Category, { foreignKey: 'id_category' });

// Product - Feedback (1-n)
Product.hasMany(Feedback, { foreignKey: 'id_product' });
Feedback.belongsTo(Product, { foreignKey: 'id_product' });

// Login - Feedback (1-n)
Login.hasMany(Feedback, { foreignKey: 'id_login' });
Feedback.belongsTo(Login, { foreignKey: 'id_login' });

// Login - Message (Sender/Receiver)
Login.hasMany(Message, { foreignKey: 'id_sender', as: 'SentMessages' });
Login.hasMany(Message, { foreignKey: 'id_receiver', as: 'ReceivedMessages' });
Message.belongsTo(Login, { foreignKey: 'id_sender', as: 'Sender' });
Message.belongsTo(Login, { foreignKey: 'id_receiver', as: 'Receiver' });

// Login - Order (1-n)
Login.hasMany(Order, { foreignKey: 'id_login' });
Order.belongsTo(Login, { foreignKey: 'id_login' });

// Order - OrderDetail (1-n)
Order.hasMany(OrderDetail, { foreignKey: 'id_order' });
OrderDetail.belongsTo(Order, { foreignKey: 'id_order' });

// Product - OrderDetail (1-n)
Product.hasMany(OrderDetail, { foreignKey: 'id_product' });
OrderDetail.belongsTo(Product, { foreignKey: 'id_product' });



module.exports = {
  AccessLevel,
  Category,
  Login,
  Information,
  Product,
  Cart,
  CartDetail,
  Contact,
  Feedback,
  Message,
  Order,
  OrderDetail,
};