const express = require('express');
const router = express.Router();
const { AnalyticsEvent } = require('../models');
const { Op } = require('sequelize');

// GET: Analytics summary
router.get('/summary', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalEvents = await AnalyticsEvent.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    const pageViews = await AnalyticsEvent.count({
      where: {
        type: 'page_view',
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Basic SQL summary (simplified for migration)
    const analyticsData = {
      summary: {
        totalEvents,
        uniqueVisitors: 0, // Requires complex query
        pageViews,
        totalDownloads: 0,
        resumeDownloads: 0,
        cvDownloads: 0
      },
      topPages: [],
      topClicks: [],
      deviceStats: [],
      period: '30 days'
    };

    res.json({
      success: true,
      data: analyticsData,
      cached: false
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// GET: Recent events list
router.get('/events', async (req, res) => {
  try {
    const events = await AnalyticsEvent.findAll({
      limit: 50,
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: {
        events: events,
        pagination: { total: events.length }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

module.exports = router;
