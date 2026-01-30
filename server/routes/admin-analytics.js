const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');
const cacheService = require('../services/cache');

// Initialize cache on first request
let cacheInitialized = false;

// GET: Analytics summary (JWT protected, with Redis caching)
router.get('/summary', async (req, res) => {
  try {
    // Initialize cache if not done
    if (!cacheInitialized) {
      await cacheService.initialize();
      cacheInitialized = true;
    }

    // Try to get from cache first (5 minute TTL)
    const cacheKey = 'analytics:summary:30days';
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('💾 Serving analytics from cache');
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date()
      });
    }

    console.log('🔄 Fetching fresh analytics data...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get total events
    const totalEvents = await AnalyticsEvent.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get unique visitors
    const uniqueVisitors = await AnalyticsEvent.distinct('visitorId', {
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get downloads count
    const downloads = await AnalyticsEvent.countDocuments({
      type: 'download',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get resume downloads
    const resumeDownloads = await AnalyticsEvent.countDocuments({
      type: 'download',
      item: 'resume',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get CV downloads
    const cvDownloads = await AnalyticsEvent.countDocuments({
      type: 'download',
      item: 'cv',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get page views
    const pageViews = await AnalyticsEvent.countDocuments({
      type: 'page_view',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get top pages
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          type: 'page_view',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get clicks by item
    const topClicks = await AnalyticsEvent.aggregate([
      {
        $match: {
          type: 'click',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$item',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get device breakdown
    const deviceStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      }
    ]);

    const analyticsData = {
      summary: {
        totalEvents,
        uniqueVisitors: uniqueVisitors.length,
        pageViews,
        totalDownloads: downloads,
        resumeDownloads,
        cvDownloads
      },
      topPages: topPages.map(p => ({ page: p._id, views: p.count })),
      topClicks: topClicks.map(c => ({ item: c._id, clicks: c.count })),
      deviceStats: deviceStats.map(d => ({ device: d._id, count: d.count })),
      period: '30 days'
    };

    // Cache the results for 5 minutes
    await cacheService.set(cacheKey, analyticsData, 300);

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics summary'
    });
  }
});

// GET: Recent events list (JWT protected)
router.get('/events', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const type = req.query.type; // filter by type: page_view, click, download
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (type && ['page_view', 'click', 'download'].includes(type)) {
      filter.type = type;
    }

    // Get total count
    const total = await AnalyticsEvent.countDocuments(filter);

    // Get events
    const events = await AnalyticsEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-ip -userAgent') // Don't expose sensitive data
      .lean();

    res.status(200).json({
      success: true,
      data: {
        events: events.map(e => ({
          _id: e._id,
          visitorId: e.visitorId.substring(0, 8) + '...', // Anonymize
          type: e.type,
          page: e.page,
          item: e.item,
          device: e.device,
          timestamp: e.createdAt
        })),
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Analytics events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics events'
    });
  }
});

// GET: Visitor details (JWT protected)
router.get('/visitor/:visitorId', async (req, res) => {
  try {
    const { visitorId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const events = await AnalyticsEvent.find({ visitorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-ip -userAgent')
      .lean();

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    // Calculate stats
    const stats = {
      totalEvents: events.length,
      pageViews: events.filter(e => e.type === 'page_view').length,
      clicks: events.filter(e => e.type === 'click').length,
      downloads: events.filter(e => e.type === 'download').length,
      firstVisit: events[events.length - 1].createdAt,
      lastVisit: events[0].createdAt,
      device: events[0].device,
      pages: [...new Set(events.map(e => e.page))].length
    };

    res.status(200).json({
      success: true,
      data: {
        visitorId,
        stats,
        events
      }
    });

  } catch (error) {
    console.error('Visitor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor details'
    });
  }
});

module.exports = router;
