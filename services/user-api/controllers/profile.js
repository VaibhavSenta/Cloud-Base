async function logOutUser(req, res) {
    
    if (!req.tokenUser) {
        res.status(401).send({ message: "You are not logged in" });
    }
    res.clearCookie('logintoken')
    
    return res.redirect('/login')
    
}


module.exports = {
    logOutUser
}