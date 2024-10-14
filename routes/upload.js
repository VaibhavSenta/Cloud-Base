const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');
const { verifyOttp } = require('../controllers/user');

// UPLOAD
router.get('/',verifyOttp, async(req, res)=>{
    console.log("GET request on signup page..");
    return res.render("upload")
})


// POST ROUTES =================================================
router.post('/',varifyToken, async(req, res)=>{
    console.log("POST request on upload page..");

    const body = req.body;
    console.log(body);

    if (!body) {
        console.log("There is an error, please provide a valid details");
        return res.redirect('/upload')
    } else {
        const user = req.body.tokenUser

        const allCategorys = ['movie', 'trailer', 'tvshow', 'cartoon', 'webseries', 'song', 'software', 'operatingsystem', 'image', 'news', 'app','game']

        if (!allCategorys.includes(body.categori)) {
            console.log("Invalid category, please choose from movie, trailer, tvshow, cartoon, webseries, song, software, operatingsystem, image, news, app, game");
            return res.redirect('/upload')
        } else {

            allCategorys.forEach(categori => {
                
                console.log(`Cheking ${categori} category..`);
    
                
                if (body.categori === categori) {
                    console.log(`Upload ${categori} details on ${categori}upload page..`);
                    
                    return res.redirect(`/upload${categori}`)
                } else {
                    return res.send(`Error uploading ${categori} details on ${categori}upload page`)
                }
                
            });
        }


    }
    
})



module.exports = {
    uploadRouter: router
}