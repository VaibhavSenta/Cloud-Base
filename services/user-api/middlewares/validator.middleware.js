const Joi = require('joi');

// Define rules for Login
const loginSchema = Joi.object({
    loginid: Joi.string().required().messages({
        'string.empty': 'Email ID or Username is required',
        'any.required': 'Email ID or Username is required'
    }),
    password: Joi.string().min(4).required().messages({
        'string.min': 'Password must be at least 4 characters long',
        'string.empty': 'Password is required'
    })
});



// Define rules for Signup
const signupSchema = Joi.object({
    userName: Joi.string().required().messages({
        'string.empty': 'Username is required',
        'any.required': 'username is required'
    }),

    email: Joi.string().required().messages({
        'string.empty': 'Email ID is required',
        'any.required': 'Email ID is required'
    }),
    
    password: Joi.string().min(4).required().messages({
        'string.min': 'Password must be at least 4 characters long',
        'string.empty': 'Password is required'
    })
});




// Middleware function
const validateLogin = (req, res, next) => {
    console.log("Validator ::", req.body);
    
    const { error } = loginSchema.validate(req.body);
    
    if (error) {
        // Create a custom error and send it to our Global Error Handler
        const customErr = new Error(error.details[0].message);
        customErr.statusCode = 400; // Bad Request
        return next(customErr);
    }
    
    next(); // Everything is fine, move to Controller
};

// Middleware function
const validateSignup = (req, res, next) => {
    const { error } = signupSchema.validate(req.body);
    
    if (error) {
        // Create a custom error and send it to our Global Error Handler
        const customErr = new Error(error.details[0].message);
        customErr.statusCode = 400; // Bad Request
        return next(customErr);
    }
    
    next(); // Everything is fine, move to Controller
};









module.exports = { 
    validateLogin,
    validateSignup
 };