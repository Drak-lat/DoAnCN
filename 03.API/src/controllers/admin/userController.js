const { Login, Information, AccessLevel } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Lấy danh sách tất cả khách hàng
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', includeDeleted = false } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    // Điều kiện lọc theo level
    if (includeDeleted === 'true') {
      where.id_level = [2, 3];
    } else {
      where.id_level = 2;
    }
    
    // Tìm kiếm
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Login.findAndCountAll({
      where,
      include: [
        {
          model: Information,
          attributes: ['name_information', 'phone_information', 'email', 'date_of_birth', 'avatar'],
          required: false,
          where: search ? {
            [Op.or]: [
              { name_information: { [Op.like]: `%${search}%` } },
              { phone_information: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } }
            ]
          } : undefined
        },
        {
          model: AccessLevel,
          attributes: ['name_level'],
          required: false
        }
      ],
      attributes: ['id_login', 'username', 'date_register', 'id_level'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_register', 'DESC']],
      distinct: true,
      subQuery: false
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
    console.error('❌ Get users error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ: ' + error.message 
    });
  }
};

// Lấy thông tin chi tiết một khách hàng
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Login.findByPk(id, {
      include: [
        {
          model: Information,
          attributes: ['name_information', 'phone_information', 'email', 'date_of_birth', 'avatar'],
          required: false
        },
        {
          model: AccessLevel,
          attributes: ['name_level'],
          required: false
        }
      ],
      attributes: ['id_login', 'username', 'date_register', 'id_level']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};

// Thêm khách hàng mới
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      name_information,
      phone_information,
      email,
      date_of_birth
    } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và password là bắt buộc'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await Login.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // Kiểm tra email đã tồn tại (nếu có)
    if (email) {
      const existingEmail = await Information.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    // Kiểm tra phone đã tồn tại (nếu có)
    if (phone_information) {
      const existingPhone = await Information.findOne({ where: { phone_information } });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã tồn tại'
        });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo tài khoản login
    const newLogin = await Login.create({
      username,
      pass: hashedPassword,
      id_level: 2,
      date_register: new Date()
    });

    // Tạo thông tin cá nhân (nếu có)
    if (name_information || phone_information || email || date_of_birth) {
      await Information.create({
        name_information: name_information || null,
        phone_information: phone_information || null,
        email: email || null,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        id_login: newLogin.id_login
      });
    }

    // Lấy thông tin user vừa tạo để trả về
    const createdUser = await Login.findByPk(newLogin.id_login, {
      include: [
        {
          model: Information,
          attributes: ['name_information', 'phone_information', 'email', 'date_of_birth'],
          required: false
        },
        {
          model: AccessLevel,
          attributes: ['name_level'],
          required: false
        }
      ],
      attributes: ['id_login', 'username', 'date_register', 'id_level']
    });

    return res.json({
      success: true,
      message: 'Thêm khách hàng thành công',
      data: createdUser
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Xóa khách hàng (soft delete - chuyển id_level = 3)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Login.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    if (user.id_level === 1) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản admin'
      });
    }

    await user.update({ id_level: 3 });

    return res.json({
      success: true,
      message: 'Xóa khách hàng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};

// Khôi phục khách hàng đã xóa
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Login.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản'
      });
    }

    if (user.id_level !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản chưa bị xóa'
      });
    }

    await user.update({ id_level: 2 });

    return res.json({
      success: true,
      message: 'Khôi phục tài khoản thành công'
    });
  } catch (error) {
    console.error('Restore user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ: ' + error.message
    });
  }
};