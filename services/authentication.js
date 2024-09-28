async function varifyToken(req, res, next) {
    const jwt = require('jsonwebtoken');
    const { USER } = require('../models/user');

    const reqToken = req.cookies.logintoken
    console.log("reqToken :",reqToken);
    if (!reqToken) {
        console.log("Can't get token from request");
        res.redirect('/login')
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
<<<<<<< HEAD
            res.redirect('/signup')
=======
            res.clearCookie('logintoken')
>>>>>>> 388f769beaef43f748a2b344e86e9ff0adecaad2
           } else {
            // Check user account ststus
                if (user.accountStatus === "deleted") {
                    console.log("User account is Deleted");
                    res.send("The User you are trying to access is deleted from database")
                } else {
        
                    // Pushh the user to req.body
                    req.body.tokenUser = user
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

module.exports = {
    varifyToken
}