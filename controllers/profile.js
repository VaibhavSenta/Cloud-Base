async function logOutUser(req, res) {
    
    console.log("Logout request from user");
    // Finding current user
    console.log("The logedin user is :",req.tokenUser);

    if (!req.tokenUser) {
        console.log("There is no loggedin user..");
        res.status(401).send({ message: "You are not logged in" });
    }
    console.log("Logout in process...");
    res.clearCookie('logintoken')
    
    console.log("LOGED OUT...");
    return res.redirect('/login')
    
}


module.exports = {
    logOutUser
}