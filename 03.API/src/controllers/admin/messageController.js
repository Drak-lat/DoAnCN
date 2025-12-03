const { Message, Login, Information, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Admin: Lấy danh sách khách hàng đã nhắn tin VỚI ADMIN NÀY
exports.getCustomersWithMessages = async (req, res) => {
  try {
    const { id_login } = req.user; // Admin ID hiện tại

    // Lấy tất cả tin nhắn liên quan đến admin này
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
          // ✅ BỎ where: { id_level: 2 } để lấy cả admin và customer
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        },
        {
          model: Login,
          as: 'Receiver',
          // ✅ BỎ where: { id_level: 2 } để lấy cả admin và customer
          attributes: ['id_login', 'username', 'id_level'],
          include: [{
            model: Information,
            attributes: ['name_information']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Xử lý để lấy danh sách customer duy nhất với tin nhắn cuối
    const customerMap = new Map();

    messages.forEach(msg => {
      // Xác định customer (không phải admin)
      let customer = null;
      
      // ✅ SỬA: Kiểm tra Sender và Receiver có tồn tại trước
      if (msg.id_sender === id_login && msg.Receiver && msg.Receiver.id_level === 2) {
        // Admin gửi cho customer
        customer = msg.Receiver;
      } else if (msg.id_receiver === id_login && msg.Sender && msg.Sender.id_level === 2) {
        // Customer gửi cho admin
        customer = msg.Sender;
      }

      if (customer && !customerMap.has(customer.id_login)) {
        customerMap.set(customer.id_login, {
          id_login: customer.id_login,
          username: customer.username,
          name_information: customer.Information?.name_information || null,
          last_message: msg.content,
          last_message_time: msg.created_at
        });
      }
    });

    const customers = Array.from(customerMap.values());

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

    const message = await Message.create({
      id_sender: id_login,
      id_receiver: customerId,
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

    // ⭐ EMIT SOCKET EVENT - Gửi tin nhắn realtime
    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', {
        receiverId: parseInt(customerId),
        senderId: id_login,
        message: newMessage
      });
    }

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