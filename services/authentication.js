async function varifyToken(req, res, next) {
    const jwt = require('jsonwebtoken');
    const { USER } = require('../models/user');

    const reqToken = req.cookies.logintoken
    console.log("reqToken :",reqToken);
    if (!reqToken || reqToken === undefined) {
        console.log("Can't get token from request");
        return res.redirect('/login')

        // return next()
    } else {


        const jwtpasskey = "vaibhav123"
    
        try {


            const tokenUser = jwt.verify(reqToken, jwtpasskey)
            console.log("The token user : ", tokenUser.email);
            
            if (!tokenUser) {
                console.log("Token invalid");
                res.send("Token expired or invalid, Try again or letter")
                return res.redirect('/login')
            }
        
        
            // Find User in database
            const user = await USER.findOne({ email: tokenUser.email })
           if (!user) {
            console.log("No user with this emil..");
            res.redirect('/signup')

            res.clearCookie('logintoken')
           } else {
            // Check user account ststus
                if (user.accountStatus === "deleted") {
                    console.log("User account is Deleted");
                    res.send("The User you are trying to access is deleted from database")
                } else {
        
                    // Pushh the user to req.body
                    // req.body.tokenUser = user

                    req.tokenUser = user

                    // console.log("reqCooki :",user);
                    console.log("Login token varified \n Authentication complete");
                    return next()
                }
            }



        } catch (err) {
            console.log(err.name);
            if (err.name === 'TokenExpiredError') {
                console.log("Error ->",err.name);
                // res.send("Token expired, Login again..")
                res.clearCookie('logintoken')
                return res.redirect('/login')
            }
        }
    }
    
    

}






async function verifyAdmin(req, res, next) {
    const jwt = require('jsonwebtoken');
    const { ADMIN } = require('../models/admin');

    const reqToken = req.cookies.admin
    console.log("req admin token :",reqToken);
    if (!reqToken || reqToken === undefined) {
        console.log("Can't get admin token from request");
        return res.redirect('/admin/login')

        // return next()
    } else {


        const jwtpasskey = "adminvaibhav"
    
        try {


            const tokenUser = jwt.verify(reqToken, jwtpasskey)
            console.log("The admin token user : ", tokenUser);
            
            if (!tokenUser) {
                console.log("Admin token invalid");
                res.send(" Admin token expired or invalid, Try again or letter")
                return res.redirect('/admin/login')
            }
        
        
            // Find User in database
            const user = await ADMIN.findOne({ _id: tokenUser.dbid })
           if (!user) {
            console.log("No Admin with this database ID..");
            res.redirect('/admin/login')

            res.clearCookie('admin')
           } else {

                req.admin = user
                console.log("Admin Login token varified \n Authentication complete");
                return next()
            }



        } catch (err) {
            console.log(err.name);
            if (err.name === 'TokenExpiredError') {
                console.log("Admin Login Error ->",err.name);
                // res.send("Token expired, Login again..")
                console.log("Admin token is expired, Login again");
                
                res.clearCookie('logintoken')
                return res.redirect('/login')
            }
        }
    }
    
    

}



module.exports = {
    varifyToken,
    verifyAdmin
}



