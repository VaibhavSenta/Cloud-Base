const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();  
const path = require('path');
const bodyParser = require('body-parser');




const port =  8080;
// process.env.PORT ||

const { varifyToken } = require('./services/authentication');

mongoose.connect("mongodb://localhost:27017/cloudebase")
.then(() => console.log('Connected to MongoDB . . . . '))
.catch(err => console.error('Could not connect to MongoDB . . . . ', err));





// Middlewares
app.use(cookieParser())

// app.use(express.urlencoded({extended: false}))
app.use(express.urlencoded({extended: false}))

// Serve files ststicaly
app.use('/public',express.static("public"))
app.use('/uploads', express.static("uploads"))
app.use('/userdocuments', express.static("userdocuments"))


app.set('view engine', "ejs") // Set view engine






// User Router
const { userRouter } = require('./routes/user');
app.use('/', userRouter)


// UPLOAD Route
const { uploadRouter } = require('./routes/upload');
app.use('/upload', uploadRouter)














// MOVIE route
const { movieRouter } = require('./routes/movies');
app.use('/movies', movieRouter)

// GAME route
app.get('/games', async (req, res) =>{
    console.log("New request to game route");
    return res.send("========================================== This page is unavailable now =============================")
})

// MUSIC route
app.get('/music', async (req, res) =>{
    console.log("New request to music route");
    return res.send("========================================== This page is unavailable now =============================")
})

// WALLPAPER route
app.get('/wallpapers', async (req, res) =>{
    console.log("New request to wallpapers route");
    return res.send("========================================== This page is unavailable now =============================")
})









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