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
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send_message', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data.message);
    }
    
    socket.emit('message_sent', data.message);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

app.set('io', io);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    await sequelize.sync();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
})();