const bcrypt = require('bcryptjs');
const { Login, Information } = require('../../models');
const { isValidPassword, isGmail, isPhone10 } = require('../../utils/validators');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id_login;
    
    const login = await Login.findOne({
      where: { id_login: userId },
      include: [{
        model: Information
      }],
      attributes: { exclude: ['pass'] } // Không trả về password
    });

    if (!login) {
      return res.status(404).json({ success: false, msg: 'Không tìm thấy thông tin người dùng' });
    }

    return res.json({
      success: true,
      data: {
        id_login: login.id_login,
        username: login.username,
        id_level: login.id_level,
        date_register: login.date_register,
        information: login.Information || {}
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id_login;
    const { name_information, phone_information, email, date_of_birth } = req.body;

    // Validate
    if (phone_information && !isPhone10(phone_information)) {
      return res.status(400).json({ success: false, msg: 'Số điện thoại không hợp lệ!' });
    }

    if (email && !isGmail(email)) {
      return res.status(400).json({ success: false, msg: 'Email không hợp lệ!' });
    }

    // Kiểm tra trùng lặp phone và email (ngoại trừ user hiện tại)
    if (phone_information) {
      const existPhone = await Information.findOne({
        where: { 
          phone_information,
          id_login: { [require('sequelize').Op.ne]: userId }
        }
      });
      if (existPhone) {
        return res.status(400).json({ success: false, msg: 'Số điện thoại đã được sử dụng!' });
      }
    }

    if (email) {
      const existEmail = await Information.findOne({
        where: { 
          email,
          id_login: { [require('sequelize').Op.ne]: userId }
        }
      });
      if (existEmail) {
        return res.status(400).json({ success: false, msg: 'Email đã được sử dụng!' });
      }
    }

    // Tìm hoặc tạo Information record
    let information = await Information.findOne({ where: { id_login: userId } });
    
    if (information) {
      // Update existing
      await information.update({
        name_information: name_information || information.name_information,
        phone_information: phone_information || information.phone_information,
        email: email || information.email,
        date_of_birth: date_of_birth || information.date_of_birth
      });
    } else {
      // Create new
      information = await Information.create({
        id_login: userId,
        name_information,
        phone_information,
        email,
        date_of_birth
      });
    }

    return res.json({
      success: true,
      msg: 'Cập nhật thông tin thành công',
      data: information
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id_login;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, msg: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Mật khẩu mới phải có ít nhất 10 ký tự gồm chữ và số' 
      });
    }

    const login = await Login.findOne({ where: { id_login: userId } });
    if (!login) {
      return res.status(404).json({ success: false, msg: 'Không tìm thấy tài khoản' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, login.pass);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, msg: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash và cập nhật mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await login.update({ pass: hashedNewPassword });

    return res.json({
      success: true,
      msg: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, msg: 'Lỗi máy chủ' });
  }
};