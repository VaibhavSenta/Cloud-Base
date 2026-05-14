const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});
const { verifyToken } = require('../middlewares/authMiddleware');





// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
router.use('/auth', AUTH);


// File upload =============================================================================
const { FILEUPLOD } = require('./fileupload.route');
router.use('/storage', verifyToken ,FILEUPLOD)












module.exports = {
    API: router
}