const express = require('express');
const mongoose = require('mongoose');
const app = express();  

const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/cloudebase")
.then(() => console.log('Connected to MongoDB . . . . '))
.catch(err => console.error('Could not connect to MongoDB . . . . ', err));





// Middlewares
app.use(express.urlencoded({extended: false}))






// Home page
app.get('/', (req, res)=>{
    console.log("New requiest at '/' ");
    const useragent = require('useragent');

        // Capture user agent string from request
        const userAgentString = req.header('User-Agent');

        // Parse the user agent string
        const agent = useragent.parse(userAgentString)
    console.log("USER :", agennt);
    return res.json({msg: "Server started..."})
})

// Sign up page
app.get('/signup', (req, res)=>{
    console.log("GET request on signup page..");
    return res.json({msg: "wellcom to signup page"})
})

// Login page
app.get('/login', (req, res)=>{
    console.log("GET request on login page..");
    return res.json({msg: "wellcom to login page"})
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