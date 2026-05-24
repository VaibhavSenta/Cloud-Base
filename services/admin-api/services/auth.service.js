

const express = require('express');
const { ADMIN, SESSION } = require('../models/centralstation');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Login Service
async function login(loginid, password, ip, userAgent) {
    // 1. Basic Validation
    if (!loginid || !password) {
        throw new Error("Please enter login details");
    }

    // 2. Find Admin 
    const user = await ADMIN.findOne({loginid: loginid}).select('firstname lastname password');

    if (!user) {
        throw new Error("Wrong login details ");
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Wrong password, Please try again");
    }

    // 4. Token & Session Generation
    try {
        const tokenData = user.toObject();
        delete tokenData.password; 

        // JWT Sign
        const loginToken = jwt.sign(
            tokenData, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1d' }
        );

        // 🎯 Create Active Session in DB
        const tokenHash = crypto.createHash('sha256').update(loginToken).digest('hex');

        const newSession = new SESSION({
            adminId: user._id,
            tokenHash: tokenHash,
            ipAddress: ip,
            userAgent: userAgent,
            deviceType: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
        });
        await newSession.save();

        let adminInfo = new Object()
        adminInfo.firstname = tokenData.firstname
        adminInfo.lastname = tokenData.lastname
        adminInfo.isloggedin = true

        return {
            token: loginToken,
            user: adminInfo,
            message: "Login verified...",
            success: true
        };

    } catch (err) {
        console.error("Error making security session :", err);
        throw new Error("Error generating security token");
    }
}

async function signup(firstname, lastname) {
    console.log("Add admin services called");
    
     if (!firstname || !lastname) {
        throw new Error("Please enter required details");
    }

    

    // Create Account
    try {
        
        const randompass = await (crypto.randomBytes(10).toString('hex'));
        const newUser = new ADMIN({
            firstname,
            lastname,
            loginid: await crypto.randomBytes(10).toString('hex'),
            password: await bcrypt.hash(randompass, 10)
        })
        console.log("New User :",newUser);
        
        await newUser.save();

        newUser.password = randompass
        return newUser;

    } catch (error) {
        console.log(`Error creating new account :`,error);
        throw new Error(error);
        
    }

}







module.exports = { 
    loginToAccount: login,
    createAccount: signup
}