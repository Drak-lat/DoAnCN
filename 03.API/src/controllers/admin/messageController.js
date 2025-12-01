const { Message, Login, Information, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Admin: Lấy danh sách khách hàng đã nhắn tin
exports.getCustomersWithMessages = async (req, res) => {
  try {
    const { id_login } = req.user; // Admin ID

    // Lấy danh sách customer đã nhắn tin với admin
    const customers = await sequelize.query(`
      SELECT DISTINCT 
        l.id_login,
        l.username,
        i.name_information,
        (SELECT content FROM messages 
         WHERE (id_sender = l.id_login OR id_receiver = l.id_login)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (id_sender = l.id_login OR id_receiver = l.id_login)
         ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM login l
      LEFT JOIN informations i ON l.id_login = i.id_login
      WHERE l.id_level = 2
      AND EXISTS (
        SELECT 1 FROM messages m 
        WHERE (m.id_sender = l.id_login OR m.id_receiver = l.id_login)
      )
      ORDER BY last_message_time DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      success: true,
      data: { customers }
    });
  } catch (error) {
    console.error('Get customers with messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Admin: Lấy tin nhắn với 1 customer cụ thể
exports.getMessagesWithCustomer = async (req, res) => {
  try {
    const { id_login } = req.user; // Admin ID
    const { customerId } = req.params;

    // Kiểm tra customer tồn tại
    const customer = await Login.findOne({
      where: { 
        id_login: customerId,
        id_level: 2
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Lấy tất cả tin nhắn giữa admin và customer
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { id_sender: id_login, id_receiver: customerId },
          { id_sender: customerId, id_receiver: id_login }
        ]
      },
      include: [
        {
          model: Login,
          as: 'Sender',
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        },
        {
          model: Login,
          as: 'Receiver',
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        }
      ],
      order: [['created_at', 'ASC']]
    });

    return res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages with customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Admin: Gửi tin nhắn cho customer
exports.sendMessageToCustomer = async (req, res) => {
  try {
    const { id_login } = req.user; // Admin ID
    const { customerId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung tin nhắn không được để trống'
      });
    }

    // Kiểm tra customer tồn tại
    const customer = await Login.findOne({
      where: { 
        id_login: customerId,
        id_level: 2
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Tạo tin nhắn mới
    const message = await Message.create({
      id_sender: id_login,
      id_receiver: customerId,
      content: content.trim()
    });

    // Lấy thông tin tin nhắn vừa tạo
    const newMessage = await Message.findByPk(message.id_message, {
      include: [
        {
          model: Login,
          as: 'Sender',
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        },
        {
          model: Login,
          as: 'Receiver',
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Send message to customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

module.exports = exports;