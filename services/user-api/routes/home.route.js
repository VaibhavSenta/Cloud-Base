const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});


// controllers
const homeController = require('../controllers/home.controller')



// Home Route
router.get(`/`, homeController.getHomeData)




module.exports = {
    homeRoute: router
}