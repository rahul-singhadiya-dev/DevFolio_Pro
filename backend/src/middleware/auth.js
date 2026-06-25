const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware for Admin Routes
 */
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'Access denied. Authorization header is missing or malformed.',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded; // Attach the decoded payload (e.g. { email }) to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: true,
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      error: true,
      message: 'Invalid authorization token.',
      code: 'TOKEN_INVALID',
    });
  }
}

module.exports = verifyAdminToken;
