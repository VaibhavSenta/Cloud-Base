const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateLogin, validateSignup } = require('../middlewares/validator.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');


const dashboardController = require('../controllers/dashboard.controller');

// Login route
router.get('/login', authController.checkLoginStatus);
router.post('/login', loginLimiter, validateLogin, authController.login);

// Global Maintenance Mode
router.get('/config/maintenance', verifyToken, dashboardController.getGlobalConfig);
router.patch('/config/maintenance', verifyToken, dashboardController.toggleGlobalMaintenance);

// System Analytics
router.get('/analytics/summary', verifyToken, dashboardController.getSystemAnalytics);

router.get('/', async (req, res)=>{
    console.log("wellcom to dashboard");
    
    return res.json({
        success: true,
        msg: "This is dashboard, data will be deliverd soon"
    })
})


module.exports = {
    MAINDASHBOARD: router
}