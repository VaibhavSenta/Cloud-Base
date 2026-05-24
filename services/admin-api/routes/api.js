const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});
const { verifyToken } = require('../middlewares/authMiddleware');





// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
router.use('/auth', AUTH);

// Admin Profile ==========================================================================
const { PROFILE } = require('./profile.route');
router.use('/profile', verifyToken, PROFILE);

// Managed Apps =======================================================================
const { MANAGEDAPPS } = require('./managedapps.route')
router.use('/managedapps', verifyToken, MANAGEDAPPS)








// Main Dashboard routes = =============================================================================
const { MAINDASHBOARD } = require('./dashboard.route')
router.use('/dashboard', verifyToken, MAINDASHBOARD)















// ====================== ALL APPS ROUTES ========================================



// Cloude Base routes = =============================================================================
const { CLOUDBASE_API } = require('../modules/cloudbase/routes/api')
router.use('/cloudbase', verifyToken, CLOUDBASE_API)







module.exports = {
    API: router
}