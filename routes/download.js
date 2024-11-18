const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const router = express.Router({ mergeParams: true });

// Varify Token
const { varifyToken } = require("../services/authentication");
const { verifyOttp } = require("../controllers/user");




router.get('/:ucbid', async(req, res)=>{
    console.log("New request tot file download.....");
    const {ucbid} = req.params;

    console.log(ucbid);

    const path = require('path');
    const fs = require('fs');
    const { MOVIE } = require('../models/movies');
    const movie = await MOVIE.findOne({ucbid: ucbid})

    if (movie) {

        const databasepath = movie.databasepath
        console.log(path.basename(databasepath));
        
        const filePath = path.resolve(__dirname, '..', 'uploads', path.basename(databasepath))

        // Check if file path is valid
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        } else {
            
            const stat = fs.statSync(filePath);
            // Set the response headers for file download
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename=${movie.details}.${movie.originalFileData.originalname}`);

             // Create a read stream and pipe it to the response
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);  
            
            // Handle errors while streaming and track downloads
            fileStream.on('error', (err) => {
                res.status(500).send('Error while downloading the file');
            });
        }
    } else {
        return res.status(404).send('Movie not found');
    }
    


})



module.exports = {
    downloadRouter: router
}