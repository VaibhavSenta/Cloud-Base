const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');

// GET routes =========================================================================
router.get('/', varifyToken,(req, res) => {
    console.log("New request to movie route");

    const { USER } = require('../models/user');
    const user = req.tokenUser
    const profileUserName = user.userName



    return res.render("movies",{
        userName: profileUserName,
    })
    
})






module.exports = {
    movieRouter: router
}