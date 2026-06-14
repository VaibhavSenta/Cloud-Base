const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from cookies OR Authorization header
 */
const protect = async (req, res, next) => {
  console.log('🔍 AuthMiddleware: All Cookies:', req.cookies);
  let token = req.cookies.token;

  // Fallback: Check Authorization header (Bearer token)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('⚠️ Auth Middleware: No token found in cookies or headers');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY');
    console.log('✅ Auth Middleware: Token verified for user', decoded.userId);
    
    // Pass everything in the payload (userId, role, sessionId)
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
