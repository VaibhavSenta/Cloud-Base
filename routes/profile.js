const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});



const { varifyToken } = require('../services/authentication');

// Preview Profile
router.get('/', varifyToken, (req, res)=>{

    const user = req.body.tokenUser

    const resUser = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
    }

    console.log(resUser);
    req.body.tokenUser = user

    console.log("Request at profile");
    return res.render('profile',resUser)
})


// Logout
const { logOutUser } = require('../controllers/profile');
router.get('/logout', varifyToken,  logOutUser);


// Delete
router.get('/delete', varifyToken, (req, res)=>{
    console.log("GET request on delete page..");

    // Finding current user
    const user = req.body.tokenUser
    console.log("The logged user is :",user);

    if (!req.body.tokenUser) {
        console.log("There is no loggedin user..");
        res.status(401).send({ message: "You are not logged in" });
    } else {

        const varifyUserDetails = {
            userName: user.userName,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            dob: user.dob,
            profilePic: user.profilePic
        }
        return res.render("delete",varifyUserDetails);
        // console.log("The user is logged in..", varifyUserDetails);
    }

})



// Update Profile
router.get('/update', varifyToken, (req, res) => {
    console.log("Request to update profile information");

    // Finding current user
    const user = req.body.tokenUser
    console.log("The logged user is :",user);

    if (!req.body.tokenUser) {
        console.log("There is no loggedin user..");
        res.status(401).send({ message: "You are not logged in" });
    } else {

        const varifyUserDetails = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            dob: user.dob,
            profilePic: user.profilePic
        }
        return res.render("update",varifyUserDetails);
        // console.log("The user is logged in..", varifyUserDetails);
    }
    
})





// Delete request to delete account
const { deleteUser } = require('../controllers/user');
const path = require('path');
const { readFileSync } = require('fs');
const { send } = require('process');
router.post('/delete', deleteUser)







// Manage Profile 0r Account
router.get('/manage',varifyToken, async(req, res)=>{

    console.log("New request to manage account..");

    const userName = req.params.profile

    const user = req.body.tokenUser
    
    
    if (!req.body.tokenUser) {
        console.log("There is no loggedin user..");
        
    }
    if (req.body.tokenUser) {
        console.log(user);

        const userInfo = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            dob: new Date(user.dob),
            profilePic: user.profilePic,
            email: user.email

        }

        console.log("User info: ", userInfo);

        // Reading HTML file\
        const html = readFileSync(path.join(__dirname, '../views/manageaccount.ejs'), 'utf8');
        // Rendering HTML
        // res.send(html.replace('{{userInfo}}', JSON.stringify(userInfo)));
        // console.log(html);
        

        return res.render('manageaccount', userInfo);

    }
    

})





module.exports = {
    profileRouter: router
}