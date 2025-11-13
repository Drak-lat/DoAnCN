const Contact = require('../../models/Contact');
const { Op } = require('sequelize');

// Lấy danh sách tất cả liên hệ
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Tìm kiếm theo tên hoặc số điện thoại
    if (search) {
      where[Op.or] = [
        { name_contact: { [Op.like]: `%${search}%` } },
        { phone_contact: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_contact', 'DESC']]
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get contacts error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ: ' + error.message 
    });
  }
};

// Lấy thông tin chi tiết một liên hệ
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ'
      });
    }

    return res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};

// Tạo liên hệ mới (cho khách hàng)
exports.createContact = async (req, res) => {
  try {
    const { name_contact, phone_contact, text_contact } = req.body;

    // Validate required fields
    if (!name_contact || !phone_contact || !text_contact) {
      return res.status(400).json({
        success: false,
        message: 'Tên, số điện thoại và nội dung là bắt buộc'
      });
    }

    // Validate phone number
    if (!/^[0-9]{10,11}$/.test(phone_contact)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    const newContact = await Contact.create({
      name_contact: name_contact.trim(),
      phone_contact: phone_contact.trim(),
      text_contact: text_contact.trim(),
      date_contact: new Date()
    });

    return res.json({
      success: true,
      message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.',
      data: newContact
    });
  } catch (error) {
    console.error('❌ Create contact error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Xóa liên hệ
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy liên hệ'
      });
    }

    await contact.destroy();

    return res.json({
      success: true,
      message: 'Xóa liên hệ thành công'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Lấy thống kê liên hệ
exports.getContactStatistics = async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const [totalContacts, thisMonthContacts, thisYearContacts] = await Promise.all([
      Contact.count(),
      Contact.count({
        where: {
          date_contact: { [Op.gte]: thisMonth }
        }
      }),
      Contact.count({
        where: {
          date_contact: { [Op.gte]: thisYear }
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        total: totalContacts,
        thisMonth: thisMonthContacts,
        thisYear: thisYearContacts
      }
    });
  } catch (error) {
    console.error('Get contact statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};