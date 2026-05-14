const globalErrorHandler = (err, req, res, next) => {
    console.error("=== GLOBAL ERROR LOG ===");
    console.error(err.stack);

    let statusCode = err.statusCode || 500; 
    let message = err.message || "Internal Server Error";

    // Mongoose duplicate key error (err.code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    return res.status(statusCode).json({
        success: false,
        status: statusCode,
        msg: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = globalErrorHandler;