const jwt = require('jsonwebtoken');

function makeToken(overrides = {}) {
  const payload = {
    _id: overrides._id || '64b7f0c2e1a2b3c4d5e6f7a8',
    email: overrides.email || 'admin@travlr.test',
    name: overrides.name || 'Admin Tester',
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { makeToken };
