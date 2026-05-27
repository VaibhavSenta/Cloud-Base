const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/all', userController.getAllUsers);
router.get('/export-csv', userController.exportUsersCSV);
router.patch('/status/:id', userController.toggleUserStatus);

module.exports = {
    USER_ROUTES: router
};
