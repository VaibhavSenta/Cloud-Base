const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthn.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

// Registration (Protected)
router.get('/register-options', verifyToken, webauthnController.startRegistration);
router.post('/verify-registration', verifyToken, webauthnController.finishRegistration);
router.delete('/credentials', verifyToken, webauthnController.removeCredentials);

// Authentication (Public)
router.post('/login-options', webauthnController.startAuthentication);
router.post('/verify-login', webauthnController.finishAuthentication);

module.exports = router;
