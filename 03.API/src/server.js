const app = require('./app');
const sequelize = require('./config/database');
const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;

// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Lưu danh sách user online
const onlineUsers = new Map(); // Map<userId, socketId>

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User đăng nhập vào socket
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online with socket ${socket.id}`);
  });

  // Gửi tin nhắn
  socket.on('send_message', (data) => {
    // data = { receiverId, message }
    const receiverSocketId = onlineUsers.get(data.receiverId);
    
    if (receiverSocketId) {
      // Gửi tin nhắn đến người nhận
      io.to(receiverSocketId).emit('receive_message', data.message);
    }
    
    // Gửi lại cho người gửi (để confirm đã gửi)
    socket.emit('message_sent', data.message);
  });

  // User ngắt kết nối
  socket.on('disconnect', () => {
    // Tìm và xóa user khỏi danh sách online
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export io để dùng trong controllers
app.set('io', io);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');
    await sequelize.sync();
    
    // Dùng server thay vì app
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`WebSocket is ready on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể kết nối database:', error);
  }
})();