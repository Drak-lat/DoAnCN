require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;
const sequelize = require('./config/database');
const fs = require('fs');
const path = require('path');

// ================== KẾT NỐI DATABASE ==================
async function startServer() {
  try {
    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Tạo folder uploads:', uploadsDir);
    }

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

startServer();
