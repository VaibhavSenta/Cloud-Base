

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');









// Login Service
async function login(loginid, password) {
    // 1. Basic Validation
    if (!loginid || !password) {
        throw new Error("Please enter login details");
    }

    
    const ADMIN = mongoose.connection.db.collection('admins')
    
    
    // 2. Find Admin 
    const user = await ADMIN.findOne(
        { loginid: loginid },
        { projection: 
            { 
                firstname: 1,
                lastname: 1,
                password: 1, 
                _id: 0 
            } 
        }
    )
    
    if (!user) {
        // Security tip: Zyada specific mat bano (e.g., "User not found") 
        // taaki attackers ko pata na chale ki kaunsi detail galat hai.
        throw new Error("Wrong login details ");
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Wrong password, Please try again");
    }

    // 4. Token Generation
    try {
        
        const tokenData = new Object(user);
        delete tokenData.password; // Security: Password ko token data se hatao
        
        // JWT Sign: tokenData mein ab _id bhi hai jo backend ke kaam aayega
        const loginToken = jwt.sign(
            tokenData, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1d' }
        );
        
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
        console.error("Error making JWT token :", err);
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
    loginToAccount: login
    // createAccount: signup
}