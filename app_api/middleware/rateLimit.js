/*
 * rate limiter for 
 *
 * Reference: Nawaz Dhandala
 * date: 03/31/2026
 * url: https://oneuptime.com/blog/post/2026-03-31-mongodb-rate-limiting/view
 *
 */
const RateLimit = require('../models/rateLimit');

// Fallbacks for dotenv
const DEFAULT_WINDOW_MS  = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000;
const DEFAULT_MAX        = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

// Fixed-window counter 
async function checkRateLimit(identifier, maxRequests, windowMs) {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const key = `${identifier}:${windowStart}`;

  const record = await RateLimit.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(windowStart + windowMs * 2) },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    allowed:   record.count <= maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    resetAt:   new Date(windowStart + windowMs),
  };
}

// Each call returns an independent limiter with its own limits
function createRateLimiter(maxRequests = DEFAULT_MAX, windowMs = DEFAULT_WINDOW_MS) {
  return async (req, res, next) => {
    try {
      const who   = req.auth?._id || req.ip;
      const route = `${req.baseUrl}${req.path}`;
      const { allowed, remaining, resetAt } =
        await checkRateLimit(`${who}:${route}`, maxRequests, windowMs);

      res.set({
        'X-RateLimit-Limit':     maxRequests,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset':     Math.floor(resetAt.getTime() / 1000),
      });

      if (!allowed) {
        return res.status(429).json({
          message: 'Too many requests',
          retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000),
        });
      }
      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      next();
    }
  };
}

module.exports = { checkRateLimit, createRateLimiter };
