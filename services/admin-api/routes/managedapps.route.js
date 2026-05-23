const express = require('express');
const router = express.Router({ mergeParams: true });
const managedapps = require('../controllers/managedapps.controllers');

// 1. Fetch all apps data for dashboard view
router.get('/', managedapps.getAllApps);

// 2. Add a new app instance
router.post('/add', managedapps.addApp);

// 3. Independent maintenance toggle switch update
router.patch('/toggle-maintenance/:id', managedapps.toggleMaintenance);

// 4. Update full app metrics/details
router.put('/update/:id', managedapps.updateApp);

module.exports = {
    MANAGEDAPPS: router
};