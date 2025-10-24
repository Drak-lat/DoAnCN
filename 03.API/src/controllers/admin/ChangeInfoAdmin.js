const { Login, Information } = require('../../models');

exports.updateAdminInfo = async (req, res) => {
  try {
    console.debug('ChangeInfoAdmin - req.body:', req.body);
    const jwtUser = req.user;
    if (!jwtUser || !jwtUser.id_login) return res.status(401).json({ success: false, msg: 'Unauthorized' });

    const id_login = jwtUser.id_login;
    const { fullName, username, dob, phone, email } = req.body || {}; // removed address

    let dobVal = null;
    if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) dobVal = dob;

    if (phone && !/^\d{10}$/.test(String(phone).trim())) {
      return res.status(400).json({ success: false, msg: 'Số điện thoại không hợp lệ' });
    }

    let info = await Information.findOne({ where: { id_login } });

    if (!info) {
      info = await Information.create({
        id_login,
        name_information: fullName ?? null,
        date_of_birth: dobVal ?? null,
        // no address_information
        phone_information: phone ?? null,
        email: email ?? null
      });
      console.debug('ChangeInfoAdmin created:', info.get({ plain: true }));
    } else {
      const upd = {};
      if (fullName !== undefined) upd.name_information = fullName;
      if (dob !== undefined) upd.date_of_birth = dobVal;
      if (phone !== undefined) upd.phone_information = phone;
      if (email !== undefined) upd.email = email;
      if (Object.keys(upd).length) await info.update(upd);
      console.debug('ChangeInfoAdmin updated:', upd);
    }

    if (username !== undefined) {
      const login = await Login.findOne({ where: { id_login } });
      if (login && login.username !== username) await login.update({ username });
    }

    const updatedInfo = await Information.findOne({ where: { id_login } });
    const updatedLogin = await Login.findOne({ where: { id_login }, attributes: ['id_login','username','id_level'] });

    const infoNormalized = {
      fullName: updatedInfo?.name_information ?? null,
      dob: updatedInfo?.date_of_birth ?? null,
      // address removed
      phone: updatedInfo?.phone_information ?? null,
      email: updatedInfo?.email ?? null
    };

    return res.json({ success: true, msg: 'Thông tin admin đã được cập nhật', info: infoNormalized, user: updatedLogin });
  } catch (err) {
    console.error('ChangeInfoAdmin error:', err);
    return res.status(500).json({ success: false, msg: 'Lỗi server' });
  }
};