const express = require('express');
const router = express.Router({ mergeParams: true });
const profileController = require('../controllers/profile.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

// Saare profile endpoints verifyToken check ke baad hi chalenge
router.get('/', verifyToken, profileController.getProfile);
router.put('/update', verifyToken, profileController.updateProfile);

// Active Sessions
router.get('/sessions', verifyToken, profileController.getSessions);
router.delete('/sessions/:sessionId', verifyToken, profileController.terminateSession);

module.exports = {
    PROFILE: router

};