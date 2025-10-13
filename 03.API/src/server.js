const app = require('./app');
const sequelize = require('./config/database');
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate(); // Test kết nối DB
    console.log('Kết nối database thành công!');
    await sequelize.sync(); // Đồng bộ model (có thể bỏ qua nếu chỉ test connect)
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Không thể kết nối database:', error);
  }
})();