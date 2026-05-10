const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});






// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
router.use('/auth', AUTH);






// 







module.exports = {
    API: router
}