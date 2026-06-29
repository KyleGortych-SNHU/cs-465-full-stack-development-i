/**
 * index.js
 *
 * API routes for the Travlr application.
 *
 * Trip writes POST and PUT and now requires an authenticated user with the admin
 * role authenticateJWT which verifies the token, then requireRole('admin') checks
 * the role claim in that token.
 */

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const requireRole = require('../middleware/requireRole');

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// rate limiter imports
const { createRateLimiter } = require('../middleware/rateLimit');
const authLimiter = createRateLimiter(10, 60 * 1000);
const readLimiter = createRateLimiter(1000, 60 * 1000);
const writeLimiter = createRateLimiter(100, 60 * 1000);

// auth endpoints
router.route('/register').post(authLimiter, authController.register);
router.route('/login').post(authLimiter, authController.login);

router
  .route('/trips')
  .get(readLimiter, tripsController.tripsList)
  .post(
    authenticateJWT,
    requireRole('admin'),
    writeLimiter,
    tripsController.tripsAddTrip
  );

router
  .route('/trips/:tripCode')
  .get(readLimiter, tripsController.tripsFindByCode)
  .put(
    authenticateJWT,
    requireRole('admin'),
    writeLimiter,
    tripsController.tripsUpdateTrip
  );

module.exports = router;
