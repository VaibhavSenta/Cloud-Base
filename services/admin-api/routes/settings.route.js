const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { checkRouteAccess } = require('../middlewares/authMiddleware');

router.get('/', settingsController.getSettings);
router.post('/update', checkRouteAccess(['ROOT']), settingsController.updateSetting);

module.exports = {
    SETTINGS: router
};
