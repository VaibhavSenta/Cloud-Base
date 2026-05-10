const jwt = require('jsonwebtoken');

const verifyLoginToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded; // Return user data (id, role etc)
    } catch (err) {
        throw new Error("Invalid or Expired Token");
    }
};

module.exports = { verifyLoginToken };