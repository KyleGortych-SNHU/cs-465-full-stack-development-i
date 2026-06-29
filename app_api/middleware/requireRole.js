/**
 * requireRole.js
 *
 * Authorization middleware runs after authenticateJWT and populates
 * req.auth from the verified token and now includes role. Rejects the
 * request with 403 unless the user's role is one of the allowed roles.
 *
 * Usage:
 *   const requireRole = require('../middleware/requireRole');
 *   router.post('/trips', authenticateJWT, requireRole('admin'), handler);
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.auth.role)) {
      return res
        .status(403)
        .json({ message: 'Admin privileges required for this action' });
    }
    next();
  };
}

module.exports = requireRole;
