const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005; // User API standard port

// 🎯 Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔌 Database Connection
mongoose.connect(process.env.CONNECTION || 'mongodb://localhost:27017/CloudBase')
    .then(() => console.log('✅ User-API connected to CloudBase DB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

// 🚀 API Routes
const { API } = require('./routes/api');
app.use('/api/v1', API);

// 🛡️ Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        msg: err.message || "Internal Server Error"
    });
});

app.listen(port, () => {
    console.log(`📡 User Service live at: http://localhost:${port}`);
});
