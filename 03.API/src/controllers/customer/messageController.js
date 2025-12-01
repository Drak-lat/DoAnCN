const { Message, Login, Information } = require('../../models');
const { Op } = require('sequelize');

// Customer: Lấy tất cả tin nhắn với admin
exports.getMyMessages = async (req, res) => {
  try {
    const { id_login } = req.user;

    // Lấy tất cả tin nhắn giữa customer và admin (id_level = 1)
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { id_sender: id_login },
          { id_receiver: id_login }
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
    console.error('Get my messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Customer: Gửi tin nhắn cho admin
exports.sendMessageToAdmin = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung tin nhắn không được để trống'
      });
    }

    // Tìm admin (id_level = 1) đầu tiên
    const admin = await Login.findOne({
      where: { id_level: 1 }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy admin'
      });
    }

    // Tạo tin nhắn mới
    const message = await Message.create({
      id_sender: id_login,
      id_receiver: admin.id_login,
      content: content.trim(),
      created_at: new Date()
    });

    // Lấy lại tin nhắn với đầy đủ thông tin
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

    return res.json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

module.exports = exports;