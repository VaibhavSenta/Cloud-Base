const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({mergeParams: true});
const CategoryController = require('../controllers/category.controller');









// Add categories
router.post('/add', CategoryController.addCategory)

// Get all categories
router.get('/list', CategoryController.getAllCategories)

// Update category
router.post('/update', CategoryController.updateCategory)









module.exports = {
    CATEGORIES: router
}