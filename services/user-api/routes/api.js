const express = require('express');
const router = express.Router();

// Import Routes
const homeRoutes = require('./v1/home.route');

// API Versioning (v1)
router.use('/home', homeRoutes);

// More routes like /movies, /games will go here...

module.exports = {
    API: router
};
