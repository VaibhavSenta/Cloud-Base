const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');



// LOGIN
router.get('/login', async(req, res)=>{
    
    console.log("GET request on login page..");
    
    
    return res.render("login")
})



// SIGN UP
router.get('/signup', async(req, res)=>{
    console.log("GET request on signup page..");
    return res.render("signup")
})





// HOME Page
router.get('/',varifyToken, (req, res)=>{
    console.log("New requiest at '/' ");

    // console.log("Token User : ",req.body.tokenUser);
    const { USER } = require('../models/user');

    const user = req.body.tokenUser
    const profileUserName = user.userName

    console.log(profileUserName);

    return res.render("index",{userName: profileUserName})
})








module.exports = {
    userRouter: router
}