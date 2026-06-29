const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');

/**
 * Register a new user.
 *
 * A normal registration creates a user with role user. If the request
 * includes an adminKey that matches process.env.ADMIN_REGISTRATION_KEY,
 * the new account is created with role admin. Supplying a wrong key is
 * rejected 403.
 *
 * On success the user is logged in immediately and a JWT is returned as
 * { token }. 
 */
const register = async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Decide the role from the optional admin key.
  let role = 'user';
  if (req.body.adminKey) {
    const expected = process.env.ADMIN_REGISTRATION_KEY;
    if (!expected || req.body.adminKey !== expected) {
      return res.status(403).json({ message: 'Invalid admin code' });
    }
    role = 'admin';
  }

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      role,
    });
    user.setPassword(req.body.password);

    await user.save();

    const token = user.generateJWT();
    return res.status(200).json({ token });
  } catch (err) {
    // Duplicate email 409 instead of a broad 500.
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'An account with that email already exists' });
    }
    if (err.name === 'ValidationError') {
      return res
        .status(400)
        .json({ message: 'Invalid user data', error: err.message });
    }
    return res
      .status(500)
      .json({ message: 'Registration failed', error: err.message });
  }
};

/**
 * Authenticate an existing user via passport local strategy.
 * Returns { token } on success, or the passport info message on failure
 * so the SPA can show an error.
 */
const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(404).json(err);
    }

    if (user) {
      const token = user.generateJWT();
      return res.status(200).json({ token });
    } else {
      return res
        .status(401)
        .json(info || { message: 'Invalid email or password' });
    }
  })(req, res);
};

module.exports = {
  register,
  login,
};
