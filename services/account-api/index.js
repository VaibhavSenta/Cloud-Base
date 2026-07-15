require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables from .env.local if it exists
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config(); // Fallback to .env
const connectDB = require('./src/common/config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: allowedOrigins, 
      methods: ["GET", "POST"],
      credentials: true 
    }
});

const PORT = process.env.PORT || 5010;

// Connect to Database
connectDB();



const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
// Middleware - GOD MODE CORS for Dev
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static serving of uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Master API Routing
const apiRoutes = require('./src/routes/api');
app.use('/api/v1', apiRoutes);

// Socket.io basic connection
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Account API', socket: 'ready' });
});

// Start Server
const HOST = '0.0.0.0'; 
server.listen(PORT, HOST, () => {
  console.log(`🚀 Account API running on http://${process.env.IP || '172.20.10.2'}:${PORT}`);
});
