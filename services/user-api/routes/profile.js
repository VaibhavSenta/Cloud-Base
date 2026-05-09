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

    console.log(resUser);
    req.tokenUser = user

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
    const user = req.tokenUser
    console.log("The logged user is :",user);

    if (!req.tokenUser) {
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
    const user = req.tokenUser
    console.log("The logged user is :",user);

    if (!req.tokenUser) {
        console.log("There is no loggedin user..");
        res.status(401).send({ message: "You are not logged in" });
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
        // console.log("The user is logged in..", varifyUserDetails);
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

    console.log("New request to manage account..");

    const userName = req.params.profile

    const user = req.tokenUser
    
    
    if (!req.tokenUser) {
        console.log("There is no loggedin user..");
        
    }
    if (req.tokenUser) {
        console.log(user);

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

        console.log("User info: ", userInfo);

        // Reading HTML file\
        const html = readFileSync(path.join(__dirname, '../views/manageaccount.ejs'), 'utf8');
        // Rendering HTML
        // res.send(html.replace('{{userInfo}}', JSON.stringify(userInfo)));
        // console.log(html);
        

        return res.render('manageaccount', userInfo);

    }
    

})



router.get('/manage/edit',varifyToken, async(req, res)=>{

    console.log("New request to edit account..");

    const userName = req.params.profile

    const user = req.tokenUser
    
    
    if (!req.tokenUser) {
        console.log("There is no loggedin user..");
        
    }
    if (req.tokenUser) {
        console.log(user);

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

        console.log("User info: ", userInfo);

        // Reading HTML file\
        const html = readFileSync(path.join(__dirname, '../views/manageaccount.ejs'), 'utf8');
        // Rendering HTML
        // res.send(html.replace('{{userInfo}}', JSON.stringify(userInfo)));
        // console.log(html);
        

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
    console.log("New request to edit account..");
    
    
    const userName = req.params.profile
    const user = req.tokenUser

    let bodyObject = new Object(req.body)
    let keyNamesOfBody = Object.keys(req.body)
    let obj1 = {}


    console.log("Checking file =================================================================");
    
    

    console.log("keyNamesOfBody", keyNamesOfBody);
    console.log("bodyObject :", bodyObject);
    console.log("obj1 :", obj1);

    
    // Checking null and undefined values and removing them from
    keyNamesOfBody.forEach(key => {
        console.log("key name :", key);
        if (bodyObject[key] != "" || bodyObject[key]!= undefined && bodyObject[key]!= '' && bodyObject[key]!= null) {
            obj1[key] = bodyObject[key]
            console.log("OBJ 1 :", obj1);
            
        } else {
            console.log("Invalid key", key);

        }
        
    });

    if (req.file || req.files) {
        console.log("File Name: " + req.file.originalname);
        console.log("File Path: " + req.file.path);
        console.log("File Size: " + req.file.size);
        console.log("File Type: " + req.file.mimetype);
        console.log("File Extension: " + req.file.ext);
        console.log("File Field Name: " + req.file.fieldname);
        console.log("============================================================");
        
        console.log("req.file :", req.file);

        // Add profile pic path to object to update
        const filePath = path.resolve(req.file.path)
        const filePathRelative = path.relative(__dirname, filePath)
        obj1[req.file.fieldname] = filePathRelative
        
    }


    console.log("Final object to update information: ", obj1);
    
    
    const { USER } = require('../models/user');
    
    // Check if user with email is already registered
    const existingUser = await USER.findOne({email: obj1.email})
    if (existingUser) {

        if (existingUser.status === "active") {
            console.log("User with email already exists.");
            return res.status(400).send("User with this email already exists , Try different email...")
        } else if (existingUser.status === "deleted") {
            console.log("User with email already exists but is deleted.");
            return res.status(400).send("User with this email already exists but is deleted, you can't add this email anywhere in CLOUD BASE Try different email...")
        } else {
            console.log("User with email already exists but is DELETED.");
            return res.send("User with email already exists or is DELETED, try again with a different email...")
            
        }
    } else {
        
        console.log("User with email does not exist.");
        
        // Check if user with phone number is already registered
        const existingPhoneNumber = await USER.findOne({phonenumber: obj1.phonenumber})
        console.log("========================================================================================= Check if user with phone number is already registered=======================================");
        if (existingPhoneNumber) {
            console.log("User with phone number already exists.");
            return res.status(400).send("User with this phone number already exists, Try different phone number...")
        } else {
            console.log("User with phone number does not exist.");
            const updatedUser = await USER.findOneAndUpdate({email: user.email}, obj1)
         
        
            // Redirect to manage page
            console.log("Redirect to manage page ==================");
            
            
            return res.redirect('/profile/manage/')
        }

    }
    // Check if user with username is already registered

    // const existingUserName = await USER.findOne({userName: obj1.userName})
    // if (existingUserName && existingUserName._id!= user._id) {
    //     console.log("User with username already exists.");
    //     return res.status(400).send("User with this username already exists, Try different username...")
    // }

    // Check if user with phone number is already registered

    // update user in database

})

module.exports = {
    profileRouter: router
}