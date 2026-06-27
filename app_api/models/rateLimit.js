/*
 * rate limiter for 
 *
 * Reference: Nawaz Dhandala
 * date: 03/31/2026
 * url: https://oneuptime.com/blog/post/2026-03-31-mongodb-rate-limiting/view
 *
 */

const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true },
  count:     { type: Number, default: 0 },
  expiresAt: { type: Date,   required: true },
});

// Mongo auto-deletes each bucket once expiresAt passes to prevent collection size explosion.
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);
