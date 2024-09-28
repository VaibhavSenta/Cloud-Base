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
        profilePic: user.profilePic
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


module.exports = {
    profileRouter: router
}