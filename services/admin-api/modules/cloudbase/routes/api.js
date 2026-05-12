const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});





// Home page
const { CATEGORIES } = require('./route.category')
router.use('/mediacategories', CATEGORIES )
















module.exports = {
    CLOUDBASE_API: router
}