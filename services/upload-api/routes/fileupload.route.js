/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router({ mergeParams: true });
const uploadController = require('../controllers/upload.controller');




// Login route
router.post('/uploadfile', uploadController.startUpload);


module.exports = {
    FILEUPLOD: router
}