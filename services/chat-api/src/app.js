const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config();

const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);

const { allowedOrigins } = require('./config/env.config');

// Enable CORS matching dynamic origin rules
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow for dev testing
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Basic Healthcheck API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'chat-api' });
});

// Register routes
const userRoutes = require('./features/users/user.routes');
const conversationRoutes = require('./features/conversations/conversation.routes');
const messageRoutes = require('./features/messages/message.routes');

app.use('/api/v1/chat/users', userRoutes);
app.use('/api/v1/chat/conversations', conversationRoutes);
app.use('/api/v1/chat/messages', messageRoutes);

// Initialize DB and Sockets
connectDB();
initSocket(server);

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => {
  console.log(`[Chat-API] Server running on port ${PORT}`);
});
