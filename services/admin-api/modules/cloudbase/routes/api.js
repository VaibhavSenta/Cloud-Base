const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});





// Home page
router.get('/', (req, res)=>{

    // Get basic detail of cloud base platform
    console.log("Getting basic details...");
    const basicDetails = new Object({
        noOfUsers: 36,
        activeUsers: 35,

    })
    console.log("Complete");
    

    return res.json({
        success: true,
        msg: "Accesseing Cloud Base",
        basicDetails
    })
})





// Add categories
router.get('/mediacategories', async(req, res)=>{
    console.log("Adding media categories ...");

    const { CATEGORYLIST } = require('../models/central.models');

    const a = await CATEGORYLIST

    console.log(a);
    
    return res.json({
        success: true
    })
    
})










module.exports = {
    CLOUDBASE_API: router
}