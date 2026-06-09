const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});
const { verifyToken } = require('../middlewares/authMiddleware');
const decryptionMiddleware = require('../middlewares/decryptionMiddleware');

// Apply Global Decryption Middleware
router.use(decryptionMiddleware);

// Auth routes =============================================================================
const {AUTH} = require('./auth.route');
const WEBAUTHN = require('./webauthn.route');
router.use('/auth', AUTH);
router.use('/auth/webauthn', WEBAUTHN);

// Admin Profile ==========================================================================
const { PROFILE } = require('./profile.route');
router.use('/profile', verifyToken, PROFILE);

// Managed Apps =======================================================================
const { MANAGEDAPPS } = require('./managedapps.route')
router.use('/managedapps', verifyToken, MANAGEDAPPS)

// Ecosystem Users =======================================================================
const { USER_ROUTES } = require('./user.route');
router.use('/users', verifyToken, USER_ROUTES);

// Global Settings =======================================================================
const { SETTINGS } = require('./settings.route');
const PUSH = require('./push.route');
router.use('/settings', verifyToken, SETTINGS);
router.use('/push', PUSH);


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