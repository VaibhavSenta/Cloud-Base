const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();  

const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/cloudebase")
.then(() => console.log('Connected to MongoDB . . . . '))
.catch(err => console.error('Could not connect to MongoDB . . . . ', err));





// Middlewares
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use(express.static('./public'))
app.set('view engine', "ejs") // Set view engine






async function varifyToken(req, res, next) {
    const jwt = require('jsonwebtoken');
    const { USER } = require('./models/user');

    const reqToken = req.cookies.logintoken
    console.log("reqToken :",reqToken);
    if (!reqToken) {
        console.log("Can't get token from request");
        res.redirect('/login')
    } else {

        const jwtpasskey = "vaibhav123"
    
        try {


            const tokenUser = jwt.verify(reqToken, jwtpasskey)
            console.log("The token user : ", tokenUser.email);
            
            if (!tokenUser) {
                console.log("Token invalid");
                res.send("Token expired or invalid, Try again or letter")
                return res.redirect('/login')
            }
        
        
            // Find User in database
            const user = await USER.findOne({ email: tokenUser.email })
           if (!user) {
            console.log("No user with this emil..");
           } else {
            // Check user account ststus
                if (user.accountStatus === "deleted") {
                    console.log("User account is Deleted");
                    res.send("The User you are trying to access is deleted from database")
                } else {
        
                    // Pushh the user to req.body
                    req.body.tokenUser = user
                    // console.log("reqCooki :",user);
                    console.log("Login token varified \n Authentication complete");
                    return next()
                }
            }



        } catch (err) {
            console.log(err.name);
            if (err.name === 'TokenExpiredError') {
                console.log("Error ->",err.name);
                // res.send("Token expired, Login again..")
                res.clearCookie('logintoken')
                return res.redirect('/login')
            }
        }
    }
    
    

}
// Home page
app.get('/',varifyToken, (req, res)=>{
    console.log("New requiest at '/' ");

    // console.log("Token User : ",req.body.tokenUser);
    
    return res.render("index")
})

// Sign up page
app.get('/signup', (req, res)=>{
    console.log("GET request on signup page..");
    return res.json({msg: "wellcom to signup page"})
})

// Login page
app.get('/login', async(req, res)=>{
    
    console.log("GET request on login page..");
    
    
    return res.render("login")
})






// Post request for sign up
const { userSignup } = require('./controllers/user');
app.post('/signup', userSignup)


// Post request for login
const { userLogin } = require('./controllers/user');
app.post('/login', userLogin)


// Delete request to delete account
const { deleteUser } = require('./controllers/user');
app.delete('/:profile/delete', deleteUser)






















app.listen(port, ()=>{

    console.log("Your server is started . . . . . ");
})