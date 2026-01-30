// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

function getClientIp(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.headers['x-forwarded-for'] ||
         'unknown';
}

function rateLimitTracker(req, res, next) {
  const clientIp = getClientIp(req);
  const now = Date.now();
  
  // Get or initialize client request log
  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, []);
  }
  
  const requests = requestCounts.get(clientIp);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Check if limit exceeded
  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(clientIp, recentRequests);
  
  // Cleanup: remove old entries periodically
  if (Math.random() < 0.01) {
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    for (let [ip, times] of requestCounts) {
      const recentTimes = times.filter(t => now - t < twoHoursAgo);
      if (recentTimes.length === 0) {
        requestCounts.delete(ip);
      } else {
        requestCounts.set(ip, recentTimes);
      }
    }
  }
  
  next();
}

module.exports = rateLimitTracker;
