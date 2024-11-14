const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');
const { resetPassword, verifyOttp, changePassword } = require('../controllers/user');




// GET ROUTES =================================================================


// LOGIN
router.get('/login', async(req, res)=>{
    
    console.log("GET request on login page..");
    
    
    return res.render("login")
})


// RESET PASSWORD
router.get('/resetpassword', async(req, res)=>{
    
    console.log("GET request on Reset password page..");
    
    
    return res.render("resetpassword")
})


// SIGN UP
router.get('/signup', async(req, res)=>{
    console.log("GET request on signup page..");
    return res.render("signup")
})

// const { uploadRouter } = require('../routes/upload');
// // UPLOAD
// router.use('/upload',varifyToken, uploadRouter)







// POST ROUTES =================================================================================


// Password Reset request
router.post('/verifyemail', resetPassword)




// Verify OTP
router.post('/verifyemail/verifyotp', verifyOttp)






// Change Password
router.post('/resetpassword/changepassword', changePassword)




// HOME Page
router.get('/',varifyToken, async(req, res)=>{
    console.log("New requiest at '/' ");

    // console.log("Token User : ",req.body.tokenUser);
    const { USER } = require('../models/user');


    const { MOVIE } = require('../models/movies');
    const movieList = await MOVIE.find()
    console.log("================================ RENDERING HOME PAGE ======================================");
    console.log(movieList);
    let indexmovieList = []
    if (movieList.length >= 4) {
        
        indexmovieList.push(movieList[0])
        indexmovieList.push(movieList[1])
        indexmovieList.push(movieList[2])
        indexmovieList.push(movieList[3])
        
    }


    const user = req.tokenUser
    const profileUserName = user.userName

    console.log(profileUserName);

    return res.render("index",{
        userName: profileUserName,
        indexmovieList: movieList
    })
})







module.exports = {
    userRouter: router
}