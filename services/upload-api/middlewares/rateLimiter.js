/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes ka window
    max: 10, // Ek IP se sirf 10 attempts allowed hain
    message: {
        success: false,
        status: 429,
        msg: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true, // Rate limit info headers mein bhejega
    legacyHeaders: false,
});

module.exports = { loginLimiter };