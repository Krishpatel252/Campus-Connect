const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Campus Connect API is running' });
});

// Modular Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/userRoutes')); // Dashboard alias
app.use('/api/academics', require('./routes/academicRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/chat', require('./routes/socialRoutes')); // Social Hub / Chat alias
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));

// ---------------------------------------------------------------------
// Real-time Communication with Socket.io
// Distinct rooms for: "General Department Room" & "Special Division Room"
// ---------------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Event to join room
  // room can be: "general" or "division_A" / "division_B"
  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Event to leave room
  socket.on('leaveRoom', ({ room }) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  // Handle incoming message and broadcast to room
  socket.on('sendMessage', async (data) => {
    try {
      const { room, sender_id, sender_name, content, channel, division, department } = data;
      
      const savedMsg = await Message.create({
        content,
        channel: channel || (room && room.startsWith('division') ? 'division' : 'general'),
        division: (division || 'A').toUpperCase(),
        department: department || 'Information Technology',
        sender: (typeof sender_id === 'string' && sender_id.length === 24) ? sender_id : null,
        sender_name: sender_name || 'User'
      });

      // Broadcast message to everyone in that room
      io.to(room).emit('receiveMessage', savedMsg);
    } catch (err) {
      socket.emit('error', { message: 'Message could not be saved', error: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});