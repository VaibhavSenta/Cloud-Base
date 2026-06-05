const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();  
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();


// Importing global error handler
const globalErrorHandler = require('./middlewares/errorMiddleware');



const HealthMonitorService = require('./services/HealthMonitorService');

const port = process.env.PORT || 5001;
const connectionString = process.env.CONNECTION

// Start Automated Infrastructure Monitoring
HealthMonitorService.start();

mongoose.connect(connectionString)
.then(async() => {
    console.log('Connected to MongoDB . . . . ');
})
.catch(err => console.error('Could not connect to MongoDB . . . . ', err))









// Middlewares
app.use(cookieParser())

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
