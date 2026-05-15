const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({mergeParams: true});
const itemController = require('../controllers/item.controller');



// Item details

router.get('/item/:slug', itemController.getItemDetails);

// Archive
router.patch('/items/:slug/archive', itemController.archiveItem)

// Add item details
router.post('/add', itemController.addItem);

// Get item list
router.get('/list', itemController.getItems);

// Update item details
router.patch('/update/:id', itemController.updateItem); 




// Link files and details
router.get('/linkfiles', async (req, res)=>{

    console.log("colacti all required data that should be sent to the frontend");
    
    return res.status(200).json({
        msg: "You'll get link file page details.",
        success: true
    })
})

router.post('/linkfiles', itemController.linkItem)



// Unlink files and details
router.patch('/unlinkall', itemController.unlinkAllFiles)

// Ulink selected files
router.patch('/unlinkselected', itemController.unlinkItemFile);


module.exports = {
    ITEM: router
}