const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});
const { verifyToken } = require('../middlewares/authMiddleware');





// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
router.use('/auth', AUTH);








// Cloude Base routes = =============================================================================
const { CLOUDBASE_API } = require('../modules/cloudbase/routes/api')
router.use('/cloudbase', verifyToken, CLOUDBASE_API)







module.exports = {
    API: router
}