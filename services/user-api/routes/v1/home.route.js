const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/home.controller');

// 🏠 Home Root
router.get('/', homeController.getHomeData);

module.exports = router;
