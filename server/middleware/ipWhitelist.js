/**
 * IP Whitelist Middleware
 * Protects admin API endpoints by checking client IP against whitelist
 * 
 * Only applies to /api/admin/* routes
 * Does NOT apply to admin page route
 * 
 * Supports:
 * - Single IPs: 49.37.12.10
 * - Multiple IPs: 49.37.12.10,103.21.244.5,127.0.0.1
 * - CIDR ranges: 103.21.244.0/24
 * - IPv6: ::1, 2001:db8::/32
 */

/**
 * Normalize IPv6 address
 * Converts ::ffff:127.0.0.1 to 127.0.0.1 for IPv4-mapped IPv6
 */
function normalizeIP(ip) {
  // Handle IPv4-mapped IPv6: ::ffff:192.168.1.1
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

/**
 * Convert IPv4 to number for CIDR checking
 */
function ipv4ToNumber(ip) {
  const parts = ip.split('.');
  return (
    (parseInt(parts[0], 10) << 24) +
    (parseInt(parts[1], 10) << 16) +
    (parseInt(parts[2], 10) << 8) +
    parseInt(parts[3], 10)
  );
}

/**
 * Check if IPv4 is in CIDR range
 * Example: isIPv4InCIDR('103.21.244.50', '103.21.244.0/24') = true
 */
function isIPv4InCIDR(ip, cidr) {
  try {
    const [subnet, bits] = cidr.split('/');
    if (!bits) return ip === subnet; // No CIDR, exact match

    const ipNum = ipv4ToNumber(ip);
    const subnetNum = ipv4ToNumber(subnet);
    const mask = -1 << (32 - parseInt(bits, 10));
    return (ipNum & mask) === (subnetNum & mask);
  } catch (e) {
    console.error(`[IPWhitelist] Error parsing CIDR ${cidr}:`, e.message);
    return false;
  }
}

/**
 * Check if IP is allowed (single IP or CIDR range)
 */
function isIPAllowed(clientIp, allowedEntry) {
  const entry = allowedEntry.trim();

  // Exact match
  if (clientIp === entry) {
    return true;
  }

  // CIDR range check
  if (entry.includes('/')) {
    if (entry.includes(':')) {
      // IPv6 - simplified check
      return clientIp.startsWith(entry.split('/')[0]);
    } else {
      // IPv4
      return isIPv4InCIDR(clientIp, entry);
    }
  }

  return false;
}

/**
 * IP Whitelist Middleware for Admin APIs
 * 
 * Usage in Express:
 *   const ipWhitelist = require('./middleware/ipWhitelist');
 *   app.use('/api/admin', ipWhitelist);
 */
function ipWhitelistMiddleware(req, res, next) {
  // Get allowed IPs from environment
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS || '';

  // Get client IP (handles reverse proxies)
  let clientIp = req.ip || req.connection.remoteAddress || '';

  // Normalize IPv6-mapped IPv4 addresses
  clientIp = normalizeIP(clientIp);

  console.log(`[IPWhitelist] Request from IP: ${clientIp} to ${req.path}`);

  // If no IPs configured, deny all
  if (!allowedIPs.trim()) {
    console.error(
      `[IPWhitelist]  DENIED: No allowed IPs configured. Access from ${clientIp} blocked.`
    );
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Admin API access is not configured',
    });
  }

  // Parse allowed IPs
  const allowedIpList = allowedIPs
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);

  // Check if client IP is in whitelist
  const isAllowed = allowedIpList.some((allowedEntry) =>
    isIPAllowed(clientIp, allowedEntry)
  );

  if (!isAllowed) {
    // IP NOT ALLOWED
    console.error(
      `[IPWhitelist]  DENIED: IP ${clientIp} attempted access to ${req.path}`
    );
    console.error(`[IPWhitelist] Allowed IPs: ${allowedIPs}`);

    return res.status(403).json({
      error: 'Access Denied',
      message: 'Your IP address is not authorized to access admin APIs',
    });
  }

  // IP IS ALLOWED - proceed
  console.log(`[IPWhitelist]  ALLOWED: IP ${clientIp} accessing ${req.path}`);
  next();
}

module.exports = ipWhitelistMiddleware;
