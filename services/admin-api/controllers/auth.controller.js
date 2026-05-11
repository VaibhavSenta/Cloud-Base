const { loginToAccount, createAccount } = require("../services/auth.service");
const jwt = require("jsonwebtoken");

// Check Login Status
const checkLoginStatus = async (req, res) => {
  const loginToken = req.cookies.login_token;
  if (!loginToken) {
    return res.json({ msg: "Please Login to account", redirectUrl: "/login" });
  }

  try {
    const decoded = jwt.verify(loginToken, process.env.JWT_SECRET_KEY);
    return res.json({
      msg: "Already logged in",
      redirectUrl: "/",
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

  // 1. Check if alredy loggedin
  const loginToken = req.cookies.login_token;
  if (loginToken) {
    try {
      // Verify token
      jwt.verify(loginToken, process.env.JWT_SECRET_KEY);

      return res.status(200).json({
        msg: "Already logged in",
        redirectUrl: "/",
      });
    } catch (err) {
      res.clearCookie("login_token");
      return res.status(401).json({
        msg: "Session expired, Please login again",
        redirectUrl: "/",
      });
    }
  }

  // 2. If not loggedin
  try {
    const result = await loginToAccount(loginid, password);

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
      redirectUrl: "/",
      user: result.user,
      success: true,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.clearCookie("login_token");
    return res.status(401).json({ msg: err.message });
    next(err);
  }
};

// Logout controller
const logout = async (req, res) => {
  res.clearCookie("login_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/", // To remove cookie from entire site
  });
  res.clearCookie("user_info", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/", // To remove cookie from entire site
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
