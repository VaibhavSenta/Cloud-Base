const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();  
const path = require('path');
const bodyParser = require('body-parser');



const port = process.env.PORT || 8080;
const connectionString = process.env.CONNECTION || "mongodb://localhost:27017/cloudebase"










const { varifyToken } = require('./services/authentication');

mongoose.connect(connectionString)
.then(async() => {

    console.log('Connected to MongoDB . . . . ');




    console.log("Checking admins ......");
    
    
    
    const { ADMIN } = require('./models/admin')
    // Find if admin there are any admins in database
    const admins = await ADMIN.find()
    console.log("Found admins: " + admins.length);
    
    if (admins.length === 0) {
        console.log("No admins found in database : " + admins.length);
    
    
        // Generate admin id
        const crypto = require('crypto')
        const min = 1000000000;
        const max = 9999999999;
    
        const admin1 = {
            firstName: 'Vaibhav',
            lastName: 'Senta',
            adminId: crypto.randomInt(min, max)
        }
        const admin2 = {
            firstName: 'Sejal',
            lastName: 'Gulhane',
            adminId: crypto.randomInt(min, max)
        }
        const admin3 = {
            firstName: 'Jeel',
            lastName: 'Chavda',
            adminId: crypto.randomInt(min, max)
        }
    
        const adminsArr = [ admin1, admin2, admin3 ]
    
        adminsArr.forEach(async admin => {
            
            console.log(" > Adding admin: " + admin);
            
            await ADMIN.create(admin)
        });
        
    }

})
.catch(err => console.error('Could not connect to MongoDB . . . . ', err))


// Check if the ADMINS were already configured or not










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



// Admin routes
const { adminRouter } = require('./routes/admin');
app.use('/admin', adminRouter);










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

// Download route
const { downloadRouter } = require('./routes/download');
app.use('/download', downloadRouter)

// POST Request

const { userSignup } = require('./controllers/user');
app.post('/signup', userSignup)


// Post request for login
const { userLogin } = require('./controllers/user');
const { hostname } = require('os');
app.post('/login', userLogin)











app.listen(port, ()=>{

    console.log(`Your server is started at port ${port} . . . . . 
        \n \n 
        
        http://localhost:${port}

        `);
})