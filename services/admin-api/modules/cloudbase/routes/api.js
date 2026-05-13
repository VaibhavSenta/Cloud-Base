const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});





// Categories
const { CATEGORIES } = require('./route.category')
router.use('/mediacategories', CATEGORIES )

// Items
const { ITEM } = require('./route.item');
router.use('/mediaitems', ITEM);














module.exports = {
    CLOUDBASE_API: router
}