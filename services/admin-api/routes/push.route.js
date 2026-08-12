/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const pushController = require('../controllers/push.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/key', pushController.getPublicKey);
router.post('/subscribe', verifyToken, pushController.subscribe);

module.exports = router;
