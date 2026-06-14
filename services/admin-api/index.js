const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();  
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();


// Importing global error handler
const globalErrorHandler = require('./middlewares/errorMiddleware');



const HealthMonitorService = require('./services/HealthMonitorService');

const port = process.env.PORT || 5001;
const connectionString = process.env.CONNECTION || "mongodb://localhost:27017/cloudbase"

// Mongoose Configuration
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // 🔥 CRITICAL: Disable buffering to prevent 10s hangs

// Database Connection Logic
let isConnecting = false;
const connectDB = async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) return;
    isConnecting = true;
    try {
        console.log('🔄 Initiating MongoDB Connection...');
        await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 10000, 
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB . . . . ');
        
        HealthMonitorService.start();
    } catch (err) {
        console.error('❌ Could not connect to MongoDB . . . . ', err.message);
    } finally {
        isConnecting = false;
    }
};

connectDB();

// Global DB Connection Middleware
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log(`⏳ [${req.method} ${req.url}] Waiting for DB connection...`);
            await connectDB();
            let retries = 0;
            while (mongoose.connection.readyState !== 1 && retries < 80) { // Wait up to 8s
                await new Promise(r => setTimeout(r, 100));
                retries++;
            }
        }
    } catch (e) {
        console.error("❌ Global DB Middleware Error:", e.message);
    }
    next();
});

// Middlewares
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET || 'cloudbase_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 * 5 } // 5 minutes
}));

// Vercel Speed Insights - Make the package available to views for client-side initialization
app.use((req, res, next) => {
    // Pass Speed Insights initialization to templates
    res.locals.vercelSpeedInsights = true;
    next();
});
app.use(express.json())
app.use(express.urlencoded({extended: true}))


const { API } = require('./routes/api');
app.use('/api/v1',API);


// Catch-all error handling middleware
app.use(globalErrorHandler);



app.listen(port, ()=>{

    console.log(`Your server is started at port ${port} . . . . . 
        \n \n 
        
        http://localhost:${port}

        `);
})
