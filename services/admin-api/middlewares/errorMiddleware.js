// middlewares/errorMiddleware.js

const globalErrorHandler = (err, req, res, next) => {
    console.error("=== GLOBAL ERROR LOG ===");
    console.error(err.stack); // Showing all error details in console for debugging



    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";



    // IF Mongoose get duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    // If Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    return res.status(statusCode).json({
        success: false,
        status: statusCode,
        msg: message,
        // Development mein error details bhejo, production mein nahi
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = globalErrorHandler;