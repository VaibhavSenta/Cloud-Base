const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const router = express.Router({mergeParams: true});



const { varifyToken } = require('../services/authentication');




router.use('/public',express.static("public"))
router.use('/userdocuments',express.static("userdocuments"))





// Preview Profile
router.get('/', varifyToken, (req, res)=>{

    const user = req.tokenUser

    const resUser = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
    }

    req.tokenUser = user

    return res.render('profile',resUser)
})


// Logout
const { logOutUser } = require('../controllers/profile');
router.get('/logout', varifyToken,  logOutUser);


// Delete
router.get('/delete', varifyToken, (req, res)=>{
    // console.log("GET request on delete page..");

    // Finding current user
    const user = req.tokenUser

    if (!req.tokenUser) {
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
    }

})



// Update Profile
router.get('/update', varifyToken, (req, res) => {
    console.log("Request to update profile information");

    // Finding current user
    const user = req.tokenUser

    if (!req.tokenUser) {
        console.log("There is no loggedin user..");
    } else {

        const varifyUserDetails = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            // dob: user.dob,
            dob: (new Date(user.dob)).getDate() + '-' + (new Date(user.dob).getMonth()) + '-' + (new Date(user.dob  ).getFullYear()),
            profilePic: user.profilePic
        }
        return res.render("update",varifyUserDetails);
    }
    
})





const path = require('path');
const { readFileSync } = require('fs');
const { send } = require('process');
const { log } = require('console');









// Delete USER
const { deleteUser } = require('../controllers/user');
router.post('/delete', varifyToken, deleteUser)




// Manage Profile 0r Account
router.get('/manage',varifyToken, async(req, res)=>{

    // console.log("New request to manage account..");

    const userName = req.params.profile

    const user = req.tokenUser
    
    
    if (!req.tokenUser) {
        
    }
    if (req.tokenUser) {

        const userInfo = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            dob: (new Date(user.dob)).getDate() + '/' + (new Date(user.dob).getMonth()) + '/' + (new Date(user.dob  ).getFullYear()),
            profilePic: user.profilePic,
            email: user.email,
            recoveryEmail: user.recoveryEmail,
            phonenumber: user.phonenumber,
            addressdob: user.dob,
            gender: user.gender,
            accountStatus: user.accountStatus
        }


        // Reading HTML file\
        const html = readFileSync(path.join(__dirname, '../views/manageaccount.ejs'), 'utf8');
        // Rendering HTML
        // res.send(html.replace('{{userInfo}}', JSON.stringify(userInfo)));
        

        return res.render('manageaccount', userInfo);

    }
    

})



router.get('/manage/edit',varifyToken, async(req, res)=>{

    // console.log("New request to edit account..");

    const userName = req.params.profile

    const user = req.tokenUser
    
    
    if (!req.tokenUser) {
    }
    if (req.tokenUser) {

        const userInfo = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            // dob: new Date(user.dob),
            dob: (new Date(user.dob)).getDate() + '-' + (new Date(user.dob).getMonth()) + '-' + (new Date(user.dob  ).getFullYear()) ,
            profilePic: user.profilePic,
            email: user.email,
            recoveryEmail: user.recoveryEmail,
            phonenumber: user.phonenumber,
            addressdob: user.dob,
            gender: user.gender,
            accountStatus: user.accountStatus
        }

        // Reading HTML file\
        const html = readFileSync(path.join(__dirname, '../views/manageaccount.ejs'), 'utf8');
        // Rendering HTML
        // res.send(html.replace('{{userInfo}}', JSON.stringify(userInfo)));
        

        return res.render('editaccount', userInfo);

    }
    

})







const multer = require('multer');


// Multer settings for profile picture upload


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './userdocuments')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
})


const upload = multer({ storage: storage });



router.post('/manage/edit',varifyToken , upload.single("profilePic"), async(req, res)=>{

    // console.log("New request to edit account..");
    
    
    const userName = req.params.profile
    const user = req.tokenUser

    let bodyObject = new Object(req.body)
    let keyNamesOfBody = Object.keys(req.body)
    let obj1 = {}

\
    
    // Checking null and undefined values and removing them from
    keyNamesOfBody.forEach(key => {
        if (bodyObject[key] != "" || bodyObject[key]!= undefined && bodyObject[key]!= '' && bodyObject[key]!= null) {
            obj1[key] = bodyObject[key]
            
        } else {
            console.log("Invalid key..");

        }
        
    });

    if (req.file || req.files) {
        // Add profile pic path to object to update
        const filePath = path.resolve(req.file.path)
        const filePathRelative = path.relative(__dirname, filePath)
        obj1[req.file.fieldname] = filePathRelative
        
    }

    
    const { USER } = require('../models/user');
    
    // Check if user with email is already registered
    const existingUser = await USER.findOne({email: obj1.email})
    if (existingUser) {

        if (existingUser.status === "active") {
            return res.status(400).send("User with this email already exists , Try different email...")
        } else if (existingUser.status === "deleted") {
            return res.status(400).send("User with this email already exists but is deleted, you can't add this email anywhere in CLOUD BASE Try different email...")
        } else {
            return res.send("User with email already exists or is DELETED, try again with a different email...")
            
        }
    } else {
        
        // Check if user with phone number is already registered
        const existingPhoneNumber = await USER.findOne({phonenumber: obj1.phonenumber})
        if (existingPhoneNumber) {
            return res.status(400).send("User with this phone number already exists, Try different phone number...")
        } else {
            const updatedUser = await USER.findOneAndUpdate({email: user.email}, obj1)            
            
            return res.redirect('/profile/manage/')
        }

    }

})

module.exports = {
    profileRouter: router
}