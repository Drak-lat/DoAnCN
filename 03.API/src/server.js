const app = require('./app');
const sequelize = require('./config/database');
const initScheduledJobs = require('./utils/cronJobs');
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate(); // Test kết nối DB
    console.log('Kết nối database thành công!');
    await sequelize.sync(); // Đồng bộ model (có thể bỏ qua nếu chỉ test connect)

    // 👇 2. Kích hoạt Cron Job SAU KHI Database đã kết nối
    initScheduledJobs();
    console.log('✅ Đã khởi động tác vụ chạy ngầm (Cron Jobs)');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Không thể kết nối database:', error);
  }
})();