const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();  
const path = require('path');

const port = process.env.PORT || 8000;


const { varifyToken } = require('./services/authentication');

mongoose.connect("mongodb://localhost:27017/cloudebase")
.then(() => console.log('Connected to MongoDB . . . . '))
.catch(err => console.error('Could not connect to MongoDB . . . . ', err));





// Middlewares
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.set('view engine', "ejs") // Set view engine
// Serve files ststicaly
app.use('/public',express.static("public"))






// UPLOAD Route
const { uploadRouter } = require('./routes/upload');
app.use('/upload', uploadRouter)

// User Router
const { userRouter } = require('./routes/user');
app.use('/', userRouter)


// Profile Route
const { profileRouter } = require('./routes/profile');
app.use('/:profile', profileRouter)


// POST Request

const { userSignup } = require('./controllers/user');
app.post('/signup', userSignup)


// Post request for login
const { userLogin } = require('./controllers/user');
app.post('/login', userLogin)




















app.listen(port, ()=>{

    console.log(`Your server is started at port ${port} . . . . . 
        \n \n 
        
        http://localhost:${port}

        `);
})