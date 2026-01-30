const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');

// POST: Track visitor event (no auth required)
router.post('/', async (req, res) => {
  try {
    const { visitorId, type, page, item, referrer, device, userAgent } = req.body;

    // Validate required fields
    if (!visitorId || !type || !page) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: visitorId, type, page'
      });
    }

    // Validate event type
    const validTypes = ['page_view', 'click', 'download'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    // Sanitize strings to prevent injection
    const sanitize = (str) => {
      if (!str) return undefined;
      return String(str).substring(0, 500).trim();
    };

    // Get client IP (server-side only, no sensitive data sent to frontend)
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.headers['x-forwarded-for'] ||
               'unknown';

    // Create analytics event
    const event = new AnalyticsEvent({
      visitorId: sanitize(visitorId),
      type: type,
      page: sanitize(page),
      item: sanitize(item),
      referrer: sanitize(referrer),
      device: device && ['mobile', 'desktop', 'tablet'].includes(device) ? device : 'desktop',
      userAgent: sanitize(userAgent),
      ip: ip,
      createdAt: new Date()
    });

    await event.save();

    // Broadcast visitor event to admins in real-time
    if (global.socketIO && global.socketIO.broadcastVisitorEvent) {
      global.socketIO.broadcastVisitorEvent({
        type: type,
        page: page,
        item: item,
        device: event.device,
        timestamp: new Date().toISOString(),
        visitorId: visitorId.substring(0, 8) // Anonymized
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking event'
    });
  }
});

module.exports = router;
