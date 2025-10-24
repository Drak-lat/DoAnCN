// controllers/customer/ChangeInfo.js
const { Login, Information } = require('../../models');
const { isPhone10 } = require('../../utils/validators');

// 🧩 Hàm chuẩn hóa định dạng ngày về yyyy-MM-dd
const formatDate = (d) => {
  if (!d) return "";
  try {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const da = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  } catch {
    return "";
  }
};

// ✅ LẤY THÔNG TIN CÁ NHÂN
exports.getInfo = async (req, res) => {
  try {
    const jwtUser = req.user;
    if (!jwtUser || !jwtUser.id_login)
      return res.status(401).json({ success: false, msg: "Unauthorized" });

    const id_login = jwtUser.id_login;
    const info = await Information.findOne({ where: { id_login } });
    const login = await Login.findOne({
      where: { id_login },
      attributes: ["id_login", "username", "id_level"]
    });

    if (!info && !login)
      return res.status(404).json({ success: false, msg: "Không tìm thấy thông tin" });

    return res.json({
      success: true,
      info: {
        fullName: info?.name_information ?? "",
        dob: formatDate(info?.date_of_birth),
        phone: info?.phone_information ?? "",
        email: info?.email ?? ""
      },
      user: login
    });
  } catch (err) {
    console.error("getInfo error:", err);
    res.status(500).json({ success: false, msg: "Lỗi server" });
  }
};

// ✅ CẬP NHẬT THÔNG TIN CÁ NHÂN
exports.updateInfo = async (req, res) => {
  try {
    const jwtUser = req.user;
    if (!jwtUser || !jwtUser.id_login)
      return res.status(401).json({ success: false, msg: 'Unauthorized' });

    const id_login = jwtUser.id_login;
    const { fullName, username, dob, phone, email } = req.body || {};

    if (
      fullName === undefined &&
      username === undefined &&
      dob === undefined &&
      phone === undefined &&
      email === undefined
    ) {
      return res.status(400).json({ success: false, msg: 'Không có trường nào để cập nhật' });
    }

    // Xử lý ngày sinh
    let dateValStr = null;
    if (dob && String(dob).trim() !== '') {
      const parts = String(dob).split('-');
      if (parts.length !== 3)
        return res.status(400).json({ success: false, msg: 'Ngày sinh không hợp lệ' });
      const [year, month, day] = parts;
      dateValStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Kiểm tra số điện thoại
    if (phone && String(phone).trim() !== '') {
      const phoneStr = String(phone).trim();
      if (!isPhone10(phoneStr) && !/^\d{10}$/.test(phoneStr))
        return res.status(400).json({ success: false, msg: 'Số điện thoại phải là 10 chữ số' });

      const existing = await Information.findOne({ where: { phone_information: phoneStr } });
      if (existing && existing.id_login !== id_login)
        return res.status(400).json({ success: false, msg: 'Số điện thoại đã được sử dụng' });
    }

    let info = await Information.findOne({ where: { id_login } });

    if (!info) {
      info = await Information.create({
        id_login,
        name_information: fullName ?? null,
        date_of_birth: dateValStr ?? null,
        phone_information: phone ?? null,
        email: email ?? null
      });
    } else {
      const updatePayload = {};
      if (fullName !== undefined) updatePayload.name_information = fullName;
      if (dob !== undefined) updatePayload.date_of_birth = dateValStr;
      if (phone !== undefined) updatePayload.phone_information = phone;
      if (email !== undefined) updatePayload.email = email;

      if (Object.keys(updatePayload).length > 0) await info.update(updatePayload);
    }

    // Cập nhật username
    if (username !== undefined) {
      const login = await Login.findOne({ where: { id_login } });
      if (login && login.username !== username) await login.update({ username });
    }

    // Lấy lại thông tin sau khi cập nhật
    const updatedInfo = await Information.findOne({ where: { id_login } });
    const updatedLogin = await Login.findOne({
      where: { id_login },
      attributes: ['id_login', 'username', 'id_level']
    });

    const infoNormalized = {
      fullName: updatedInfo?.name_information ?? null,
      dob: formatDate(updatedInfo?.date_of_birth),
      phone: updatedInfo?.phone_information ?? null,
      email: updatedInfo?.email ?? null
    };

    return res.json({
      success: true,
      msg: 'Cập nhật thành công',
      info: infoNormalized,
      user: updatedLogin
    });
  } catch (err) {
    console.error('ChangeInfo.updateInfo error:', err);
    return res.status(500).json({ success: false, msg: 'Lỗi server' });
  }
};
