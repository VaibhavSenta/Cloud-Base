const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});

// Varify Token
const { varifyToken } = require('../services/authentication');
const { verifyOttp } = require('../controllers/user');

// UPLOAD
router.get('/', async(req, res)=>{
    console.log("GET request on Upload page..");
    return res.render("upload")
})


// POST ROUTES =================================================
router.post('/', varifyToken,  async(req, res)=>{
    console.log("POST request on upload page..");

    const body = req.body;
    
    console.log(body);

    if (body) {
        console.log("Deta collected from user");

        console.log("Selected file Type is ", body.categori);

        const arr1 = ["movie", "trailer", "tvshow", "cartoon","webseries", "song", "software", "operatingsystem", "image", "news", "app", "game"]
        console.log("Checking is this categori valid or not");

        arr1.forEach(categori => {
            console.log("Cheking ", categori, "...");
            if (body.categori === categori) {
                console.log("Categori is valid");

                // Fatch user frome Data Base
                function fatchUser() {
                    
                    const { USER } = require('../models/user');

                    const user = req.body.tokenUser
                    const profileUserName = user.userName

                    console.log(profileUserName);

                    return profileUserName;
                }

                const profileUserName = fatchUser()

                return res.render(`upload${categori}`, {userName: profileUserName});

            } else {
                return res.status(5000)
            }
            
        });
        
        
    } else {
        return console.log("No data collected from user");

        
    }
      

    
    
})



module.exports = {
    uploadRouter: router
}