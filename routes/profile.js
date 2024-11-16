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
const { log } = require('console');
router.post('/delete', deleteUser)







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
            dob: new Date(user.dob),
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
            dob: new Date(user.dob),
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

    const { firstName, lastName, dob, gender, email, recoveryEmail, phonenumber} = req.body

    const formdata = [ firstName, lastName, dob, gender, email, recoveryEmail, phonenumber ]


    console.log("Form data: ", formdata);

    formdata.forEach( async fild => {
        
        if (fild === undefined || fild === '' || fild === "") {
            console.log("No data in fild", fild);
            formdata.reduce()
            
        } else {
            console.log("Updating fild", fild);
            // update user in database
            const { USER } = require('../models/user');
            const updateUser = await USER.findOneAndUpdate({email: user.email}, {
                
            });

            console.log("updated user", updateUser);
            

        }
    });


    // update user in database
    // const updatedUser = await User.findByIdAndUpdate(user._id, formdata, { new: true })
    // console.log("Updated user: ", updatedUser);

    // Redirect to manage page
    return console.log("Redirect to manage page ==================");
     
    // res.redirect('/profile/manage/')

})

module.exports = {
    profileRouter: router
}