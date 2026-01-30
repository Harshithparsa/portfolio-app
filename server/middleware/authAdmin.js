/**
 * JWT Admin Authentication Middleware
 * Verifies JWT token for admin API requests
 * 
 * Usage:
 *   const authAdmin = require('./middleware/authAdmin');
 *   router.put('/api/admin/profile', authAdmin, profileUpdateHandler);
 */

const jwt = require('jsonwebtoken');

function authAdminMiddleware(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   console.log(`[AuthAdmin] BYPASS: No token, allowing public access.`);
  //   next(); 
  //   return;
  //     // return res.status(401).json({
  //     //   error: 'Unauthorized',
  //     //   message: 'JWT token required. Please login first.',
  //     // });
  //   }

  // Extract token (format: "Bearer <token>")
  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(`[AuthAdmin] ✅ VALID TOKEN: User ${decoded.username} accessing ${req.path}`);

    // Attach decoded token to request for use in handlers
    req.admin = decoded;
    next();
  } catch (err) {
    console.error(`[AuthAdmin] ❌ INVALID TOKEN: ${err.message}`);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'JWT token expired. Please login again.',
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or malformed JWT token.',
    });
  }
}

module.exports = authAdminMiddleware;
