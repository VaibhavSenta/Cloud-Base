const { loginToAccount, createAccount } = require("../services/auth.service");
const jwt = require("jsonwebtoken");

// Check Login Status
const checkLoginStatus = async (req, res) => {
  const loginToken = req.cookies.login_token;
  const { SESSION } = require('../models/centralstation');
  const crypto = require('crypto');

  if (!loginToken) {
    return res.json({ msg: "Please Login to account", redirectUrl: "/login" });
  }

  try {
    const decoded = jwt.verify(loginToken, process.env.JWT_SECRET_KEY);
    
    // 🎯 Session Verification in DB
    const tokenHash = crypto.createHash('sha256').update(loginToken).digest('hex');
    const session = await SESSION.findOne({ tokenHash, isValid: true });

    if (!session) {
      res.clearCookie("login_token");
      return res.json({ redirectUrl: "/login", msg: "Session invalid or expired" });
    }

    return res.json({
      msg: "Already logged in",
      redirectUrl: "/dashboard",
      user: decoded,
    });
  } catch (err) {
    res.clearCookie("login_token");
    return res.json({ redirectUrl: "/login", msg: "Session expired" });
  }
};

const signup = async (req, res, next) => {
  console.log("Auth controller called");
  const { firstname, lastname } = req.body;

  try {
    const result = await createAccount(firstname, lastname);
    if (result) {
      const logincredentials = {
        firstname: result.firstname,
        lastname: result.lastname,
        loginid: result.loginid,
        password: result.password,
      };

      return res.json({
        msg: "Admin added",
        redirectUrl: "/login",
        success: true,
        logincredentials,
      });
    }
  } catch (err) {
    console.error("Add admin error:", err);
    next(err);
  }
};

// Login controller
const login = async (req, res, next) => {
  
  const { loginid, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // 1. Check if alredy loggedin
  const loginToken = req.cookies.login_token;
  if (loginToken) {
    try {
      // Verify token
      jwt.verify(loginToken, process.env.JWT_SECRET_KEY);

      return res.status(200).json({
        msg: "Already logged in",
        redirectUrl: "/dashboard",
      });
    } catch (err) {
      res.clearCookie("login_token");
      return res.status(401).json({
        msg: "Session expired, Please login again",
        redirectUrl: "/login",
      });
    }
  }

  // 2. If not loggedin
  try {
    const result = await loginToAccount(loginid, password, ip, userAgent);

    res.cookie("login_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("user_info", result.user, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      msg: "Login successful",
      redirectUrl: "/dashboard",
      user: result.user,
      success: true,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.clearCookie("login_token");
    return res.status(401).json({ msg: err.message });
  }
};

// Logout controller
const logout = async (req, res) => {
  const loginToken = req.cookies.login_token;
  const { SESSION } = require('../models/centralstation');
  const crypto = require('crypto');

  if (loginToken) {
    try {
      const tokenHash = crypto.createHash('sha256').update(loginToken).digest('hex');
      await SESSION.findOneAndUpdate({ tokenHash }, { isValid: false });
    } catch (err) {
      console.error("Error invalidating session on logout:", err);
    }
  }

  res.clearCookie("login_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/", 
  });
  res.clearCookie("user_info", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/", 
  });

  return res.status(200).json({
    success: true,
    msg: "Logout successful. See you soon!",
    redirectUrl: "/login",
  });
};

module.exports = {
  checkLoginStatus,
  login,
  logout,
  signup,
};
