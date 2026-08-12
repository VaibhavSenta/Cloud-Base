/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket Auth Middleware supporting cookies, query, and auth token
  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers?.cookie);
      const rawToken = socket.handshake.auth?.token || socket.handshake.query?.token || cookies.cb_chat_token || cookies.token;

      if (!rawToken) {
        console.log('⚠️ [Chat-API] Socket Connection Refused: No token provided');
        return next(new Error('Authentication error: Token missing.'));
      }

      const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV');
      const userId = decoded.userId || decoded.id || decoded._id;

      if (!userId) {
        return next(new Error('Authentication error: Invalid payload structure.'));
      }

      socket.user = decoded;
      socket.userId = String(userId);
      next();
    } catch (err) {
      console.error('❌ [Chat-API] Socket Auth Failure:', err.message);
      return next(new Error('Authentication error: Invalid Token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 [Chat-API] Socket Connected: ${socket.id} (User: ${userId})`);

    // Join personal user room for direct notification delivery
    socket.join(userId);

    // Broadcast user online status
    socket.broadcast.emit('user_status_change', { userId, status: 'online' });

    // Handle typing status broadcast (2 dots wave animation event)
    socket.on('typing_start', ({ receiverId, conversationId }) => {
      if (receiverId) {
        io.to(String(receiverId)).emit('user_typing', {
          senderId: userId,
          conversationId,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', ({ receiverId, conversationId }) => {
      if (receiverId) {
        io.to(String(receiverId)).emit('user_typing', {
          senderId: userId,
          conversationId,
          isTyping: false
        });
      }
    });

    // Handle key rotation envelope exchange (Approach B)
    socket.on('rotate_key_exchange', ({ receiverId, conversationId, encryptedKeyEnvelope, keyVersion }) => {
      if (receiverId && encryptedKeyEnvelope) {
        io.to(String(receiverId)).emit('key_rotation_received', {
          senderId: userId,
          conversationId,
          encryptedKeyEnvelope,
          keyVersion
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ [Chat-API] Socket Disconnected: ${socket.id} (User: ${userId})`);
      socket.broadcast.emit('user_status_change', { userId, status: 'offline' });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const disconnectUserSession = async (userId, sessionId) => {
  if (!io) return;
  try {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      const socketUserId = socket.userId;
      const socketSessionId = socket.user?.sessionId;

      const userIdMatches = socketUserId && String(socketUserId) === String(userId);
      const sessionIdMatches = !sessionId || (socketSessionId && String(socketSessionId) === String(sessionId));

      if (userIdMatches && sessionIdMatches) {
        console.log(`🔌 [Chat-API] Force disconnecting socket ${socket.id} for user ${userId} (session: ${sessionId || 'all'})`);
        socket.disconnect(true);
      }
    }
  } catch (err) {
    console.error('⚠️ [Chat-API] Failed to force disconnect sockets:', err.message);
  }
};

module.exports = { initSocket, getIO, disconnectUserSession };
