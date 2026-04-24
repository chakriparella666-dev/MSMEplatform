/**
 * Lightweight in-memory rate limiter (no external dependencies).
 * Resets counters every 15 minutes automatically.
 */

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100

const store = new Map()

/**
 * Remove expired rate-limit entries.
 */
const cleanup = () => {
  const now = Date.now()
  for (const [key, data] of store.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      store.delete(key)
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanup, WINDOW_MS)

/**
 * Express middleware that limits each IP to 100 requests per 15-minute window.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.rateLimiter = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()

  if (!store.has(key)) {
    store.set(key, { count: 1, startTime: now })
    return next()
  }

  const data = store.get(key)

  // Reset if window has passed
  if (now - data.startTime > WINDOW_MS) {
    store.set(key, { count: 1, startTime: now })
    return next()
  }

  if (data.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((data.startTime + WINDOW_MS - now) / 1000)
    res.setHeader('Retry-After', retryAfter)
    return res.status(429).json({
      success: false,
      message: `Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      retryAfter
    })
  }

  data.count += 1
  return next()
}

