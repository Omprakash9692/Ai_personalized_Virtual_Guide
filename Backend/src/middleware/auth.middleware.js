const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

/**
 * Middleware to verify JWT token and protect routes.
 * Extracts userId from token and attaches it to req.user.
 */
function protect(req, res, next) {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Missing token.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user information to request object
    req.user = decoded;
    
    // We can also override req.body.userId if we want to enforce it globally 
    // based on the token, but for now, we just attach it to req.user.
    if (req.body && !req.body.userId) {
      req.body.userId = decoded.userId;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route. Invalid token.',
    });
  }
}

module.exports = { protect };
