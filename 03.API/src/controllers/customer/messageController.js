const { Message, Login, Information } = require('../../models');
const { Op } = require('sequelize');

// ✅ THÊM MỚI: Lấy danh sách admin available
exports.getAvailableAdmins = async (req, res) => {
  try {
    const admins = await Login.findAll({
      where: { id_level: 1 },
      attributes: ['id_login', 'username'],
      include: [{
        model: Information,
        attributes: ['name_information', 'avatar']
      }],
      order: [['id_login', 'ASC']]
    });

    return res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    console.error('Get available admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// ✅ SỬA LẠI: Lấy tin nhắn với admin cụ thể
exports.getMyMessages = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { adminId } = req.query; // ✅ Thêm filter theo adminId

    const whereClause = {
      [Op.or]: [
        { id_sender: id_login },
        { id_receiver: id_login }
      ]
    };

    // ✅ Nếu có adminId, chỉ lấy tin nhắn với admin đó
    if (adminId) {
      whereClause[Op.or] = [
        { id_sender: id_login, id_receiver: adminId },
        { id_sender: adminId, id_receiver: id_login }
      ];
    }

    const messages = await Message.findAll({
      where: whereClause,
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

// ✅ SỬA LẠI: Gửi tin nhắn cho admin CỤ THỂ
exports.sendMessageToAdmin = async (req, res) => {
  try {
    const { id_login } = req.user;
    const { content, adminId } = req.body; // ✅ Nhận adminId từ client

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung tin nhắn không được để trống'
      });
    }

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn admin để nhắn tin'
      });
    }

    // ✅ Kiểm tra admin tồn tại
    const admin = await Login.findOne({
      where: { 
        id_login: adminId,
        id_level: 1 
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy admin'
      });
    }

    const message = await Message.create({
      id_sender: id_login,
      id_receiver: adminId, // ✅ Gửi cho admin cụ thể
      content: content.trim(),
      created_at: new Date()
    });

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

    // ✅ Emit socket cho admin cụ thể
    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', {
        receiverId: adminId,
        senderId: id_login,
        message: newMessage
      });
    }

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