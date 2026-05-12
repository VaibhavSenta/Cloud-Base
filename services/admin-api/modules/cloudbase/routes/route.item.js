const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({mergeParams: true});
const itemController = require('../controllers/item.controller');





// Add item details
router.post('/add', itemController.addItem);

// Get item list
router.get('/list', itemController.getItems);

// Update item details
router.patch('/update/:id', itemController.updateItem); 





module.exports = {
    ITEM: router
}