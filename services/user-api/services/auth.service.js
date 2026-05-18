

const express = require('express');
const { USER } = require('../models/centralstation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');









// Login Service
async function login(loginid, password) {
    // 1. Basic Validation
    if (!loginid || !password) {
        throw new Error("Please enter login details");
    }

    // 2. Find User (Email ya Username dono se search karega)
    // password ko select mein rakha hai comparison ke liye
    const user = await USER.findOne({ 
        $or: [
            { userName: loginid },
            { email: loginid }
        ] 
    }).select('userName password email firstName lastName profilePic dob gender accountStatus');
    
    if (!user) {
        // Security tip: Zyada specific mat bano (e.g., "User not found") 
        // taaki attackers ko pata na chale ki kaunsi detail galat hai.
        throw new Error("Wrong email ID or Password");
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Wrong password, Please try again");
    }

    // 4. Token Generation
    try {
        const tokenData = user.toObject();
        delete tokenData.password; // Security: Password ko token data se hatao
        
        // JWT Sign: tokenData mein ab _id bhi hai jo backend ke kaam aayega
        const loginToken = jwt.sign(
            tokenData, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '30d' }
        );
        
        let userInfo = new Object()
        userInfo.userName = tokenData.userName
        userInfo.profilePic = tokenData.profilePic
        userInfo.isloggedin = true
        
        
        return {
            token: loginToken,
            user: userInfo,
            message: "Login verified...",
            success: true
        };

    } catch (err) {
        console.error("Error making JWT token :", err);
        throw new Error("Error generating security token");
    }
}

async function signup(email, password, userName) {

    
     if (!email || !password || !userName) {
        throw new Error("Please enter signup details");
    }

    // Check if user alredy exist
    try {
        
        const userExists = await USER.findOne({
            $or: [
                { email: email },
                { userName: userName }
            ]
        });
    
        if (userExists) {
            if (userExists.email === email && userExists.userName === userName) {
                throw new Error("Email and Username already taken");
                
            } else if (userExists.email === email) {
                throw new Error("Email already registered");
                
            } else {
                throw new Error("Username already taken");
                
            }
        }
    } catch (error) {
        console.error(error)
        throw new Error(error.message);
        
    }

    // Create Account
    try {
        
        const newUser = new USER({
            email,
            userName,
            password: await bcrypt.hash(password, 10)
        })
        await newUser.save();

        return newUser;

    } catch (error) {
        throw new Error(error);
        
    }

}







module.exports = { 
    loginToAccount: login,
    createAccount: signup
}