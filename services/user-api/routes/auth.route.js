const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateLogin, validateSignup } = require('../middlewares/validator.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');


// 1. GET /api/auth/login (Check if already logged in)
// Note: Do not use 'verifyToken' middleware here, because the logic is already inside 

// Login route
router.get('/login', authController.checkLoginStatus);
router.post('/login', loginLimiter, validateLogin, authController.login);

// Logout route
router.get('/logout', verifyToken, async(req, res)=>{return res.json({msg: "Are you sure you want to logot ?"})})
router.post('/logout', verifyToken, authController.logout);

// Signup route
router.get('/signup', async(req,res)=>{return res.json({msg: `Create new ccount`})});
router.post('/signup', loginLimiter, validateSignup, authController.signup);






module.exports = {
    AUTH: router
};