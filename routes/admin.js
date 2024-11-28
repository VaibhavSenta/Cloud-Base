const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const user = require('./user');
const router = express.Router({mergeParams: true});
const path = require('path')

// Varify Token
const { verifyAdmin } = require('../services/authentication');
// const { resetPassword, verifyOttp, changePassword } = require('../controllers/user');







// Middelwares
router.use('/public',express.static("public"))
router.use('/uploads', express.static("uploads"))
router.use('/userdocuments', express.static("userdocuments"))




















// GET requests =================================================
router.get('/', verifyAdmin,async(req, res)=>{
    console.log("New request to admin route");

    const admin = req.admin

    const { MOVIE } = require('../models/movies');
    const movieList = await MOVIE.find()





    return res.render("adminindex",{
        firstName: admin.firstName || "Admin",
        lastName: admin.lastName || " "
        
    })
})


router.get('/allusers', verifyAdmin,async(req, res)=>{
    console.log("New request to admin logindevicedetails route");

    const admin = req.admin


    const { LOGINDEVICEDETAILS, USER } = require('../models/user');
    const users = await USER.find().sort({email: 1});
    let details = [];
    users.forEach(user => {
        details.push({
            email: user.email,
            recoveryEmail: user.recoveryEmail,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            phonenumber: user.phonenumber,
            accountStatus: user.accountStatus,
            gender: user.gender,
            dob: (new Date(user.dob)).getDate() + '/' + (new Date(user.dob)).getMonth() + '/' + (new Date(user.dob)).getFullYear(),

        })
    });

    console.log(details);
    

    return res.render("allusers",{
        details: details,
        adminName: admin.firstName + ' ' + admin.lastName
        
    })
})


router.get('/allusers/:email', verifyAdmin,async(req, res)=>{
    console.log("New request to admin User route");

    const admin = req.admin

    const userEmail = req.params.email
    if (!userEmail) {
        return res.status(404).send("Please select a valid email address")

    }

    const { LOGINDEVICEDETAILS, USER } = require('../models/user');
    const user = await USER.findOne({email: userEmail})

    const signup = user.signUpDeviceDetails
    const signupKeys = Object.keys(signup)
   
    
    const detail = {
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dob: (new Date(user.dob)).getDate() + '/' + (new Date(user.dob)).getMonth() + '/' + (new Date(user.dob)).getFullYear(),
        couentryCode: user.countryCode,
        phonenumber: user.phonenumber,
        recoveryEmail: user.recoveryEmail,
        profilePic: user.profilePic,
        accountStatus: user.accountStatus,
        logedinDevices: user.logedinDevices.length,
        createdAt: (new Date(user.createdAt)).getDate() + '/' + (new Date(user.createdAt)).getMonth() + '/' + (new Date(user.updatedAt)).getFullYear(),
        updatedAt: (new Date(user.updatedAt)).getDate() + '/' + (new Date(user.updatedAt)).getMonth() + '/' + (new Date(user.updatedAt)).getFullYear()

    }

    console.log(detail);
    

    return res.render("userdetails",{
        detail: detail,
        signupKeys: signupKeys,
        signup: signup,
        adminName: admin.firstName + ' ' + admin.lastName
        
    })
})


router.get('/login', (req, res) => {
    console.log("Login request on admin ....");

    return res.render("adminlogin")
    
})

router.get('/logout', (req, res) => {
    console.log("Logout request on admin ....");
    
    return res.clearCookie("admin").redirect('/admin')
})


router.get('/movies', verifyAdmin,async (req, res) => {
    console.log("Movie request on admin ....");
    
    const admin = req.admin

    const { MOVIE } = require('../models/movies')
    const allMovies = await MOVIE.find({})

    return res.render("adminmovies",{
        movies: allMovies,
        adminName: admin.firstName + ' ' + admin.lastName
    })
    
})

router.get('/movies/:ucbid',verifyAdmin ,async(req, res) => {
    console.log("New request to movie route");
    const admin = req.admin
    console.log("Requesr perams:", req.params)
    const ucbid = req.params.ucbid

    const { MOVIE } = require('../models/movies');
    const movie = await MOVIE.findOne({ucbid: ucbid})

    if (!movie) {
        return res.status(404).send("Movie not found")
    }

    console.log("UCBID MOVIE :",movie);
    // render movie page with user name and movie details
    return res.render("adminmovie",{
        userName: admin.firstName + ' ' + admin.lastName,
        movie: movie
    })
    
})







// router.post()

// POST requests =================================================================

router.post('/login', async(req, res) => {
    console.log("Login request on admin ....");

    const { adminid } = req.body;

    const { ADMIN } = require('../models/admin')
    const jwt = require('jsonwebtoken');

    const admin = await ADMIN.findOne({adminId: adminid})

    if (!admin) {
        console.log("Admin not found");
        console.log("Look like you are not authorized to login as admin");

        return res.status(403).send("Look like you are not authorized to login")

        
        
    } else {
        console.log("Admin found");
        console.log("Admin : " + admin);
        
        // Generate cookie for admin
        const adminCookie = {
            firstName: admin.firstName,
            lastName: admin.lastName,
            dbid: admin._id
        }
        const jwtadminCookie = jwt.sign(adminCookie, 'adminvaibhav',{expiresIn: '24h'})
        return res.cookie('admin',jwtadminCookie).redirect("/admin")
        
    }
    
})

router.post('/movies/delete', verifyAdmin, async (req, res) => {
    console.log("New request to delete the movie from admin ");

    const { ucbid } = req.body

    const fs = require('fs');
    const { MOVIE } = require('../models/movies');
    const movie = await MOVIE.findOne({ucbid: ucbid})

    await MOVIE.findOneAndDelete({ucbid: ucbid}).then( (err) => {
        if (err) {
            console.log("Error deleting movie: ",err);
            
        } else {
            
            console.log("Movie deleted");
            console.log("Deleteing files...");
    
            fs.unlink(movie.databasepath)
            fs.unlink(movie.poster)
        }
        
        
    })

    return res.send("Movie deleted")
    
})


// logindevicedetails.ejs



module.exports = {
    adminRouter: router
}