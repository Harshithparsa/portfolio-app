const { gql } = require('apollo-server-express');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const cacheService = require('../services/cache');

// GraphQL Type Definitions
const typeDefs = gql`
  type Query {
    analytics: AnalyticsData!
    analyticsEvents(limit: Int, type: String): [Event!]!
    topPages(limit: Int): [PageStat!]!
    topClicks(limit: Int): [ClickStat!]!
    deviceStats: [DeviceStat!]!
    visitorInfo(visitorId: ID!): VisitorInfo
    health: HealthStatus!
  }

  type AnalyticsData {
    summary: AnalyticsSummary!
    topPages: [PageStat!]!
    topClicks: [ClickStat!]!
    deviceStats: [DeviceStat!]!
    period: String!
    timestamp: String!
    cached: Boolean!
  }

  type AnalyticsSummary {
    totalEvents: Int!
    uniqueVisitors: Int!
    pageViews: Int!
    totalDownloads: Int!
    resumeDownloads: Int!
    cvDownloads: Int!
  }

  type PageStat {
    page: String!
    views: Int!
  }

  type ClickStat {
    item: String!
    clicks: Int!
  }

  type DeviceStat {
    device: String!
    count: Int!
  }

  type Event {
    id: ID!
    visitorId: String!
    type: String!
    page: String!
    item: String
    device: String!
    timestamp: String!
  }

  type VisitorInfo {
    visitorId: ID!
    totalEvents: Int!
    lastSeen: String!
    device: String!
    pages: [String!]!
  }

  type HealthStatus {
    status: String!
    mongodb: String!
    redis: String!
    uptime: Float!
    timestamp: String!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    // Get full analytics dashboard data
    async analytics(_, args, context) {
      try {
        const cacheKey = 'graphql:analytics:30days';
        
        // Try cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          console.log('💾 GraphQL analytics from cache');
          return {
            ...cached,
            cached: true,
            timestamp: new Date().toISOString()
          };
        }

        console.log('🔄 GraphQL analytics - fetching fresh data');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Fetch summary data
        const totalEvents = await AnalyticsEvent.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        });

        const uniqueVisitors = await AnalyticsEvent.distinct('visitorId', {
          createdAt: { $gte: thirtyDaysAgo }
        });

        const pageViews = await AnalyticsEvent.countDocuments({
          type: 'page_view',
          createdAt: { $gte: thirtyDaysAgo }
        });

        const downloads = await AnalyticsEvent.countDocuments({
          type: 'download',
          createdAt: { $gte: thirtyDaysAgo }
        });

        const resumeDownloads = await AnalyticsEvent.countDocuments({
          type: 'download',
          item: 'resume',
          createdAt: { $gte: thirtyDaysAgo }
        });

        const cvDownloads = await AnalyticsEvent.countDocuments({
          type: 'download',
          item: 'cv',
          createdAt: { $gte: thirtyDaysAgo }
        });

        // Fetch top pages
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
            $limit: 10
          }
        ]);

        // Fetch top clicks
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
            $limit: 10
          }
        ]);

        // Fetch device stats
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

        const data = {
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
          period: '30 days',
          cached: false
        };

        // Cache for 5 minutes
        await cacheService.set(cacheKey, data, 300);

        return {
          ...data,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('GraphQL analytics error:', error);
        throw error;
      }
    },

    // Get recent events
    async analyticsEvents(_, { limit = 50, type }, context) {
      try {
        const query = {};
        if (type) query.type = type;

        const events = await AnalyticsEvent.find(query)
          .sort({ createdAt: -1 })
          .limit(Math.min(limit, 500));

        return events.map(e => ({
          id: e._id,
          visitorId: e.visitorId.substring(0, 8),
          type: e.type,
          page: e.page,
          item: e.item,
          device: e.device,
          timestamp: e.createdAt.toISOString()
        }));
      } catch (error) {
        console.error('GraphQL events error:', error);
        throw error;
      }
    },

    // Get top pages
    async topPages(_, { limit = 10 }, context) {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
            $limit: Math.min(limit, 50)
          }
        ]);

        return topPages.map(p => ({ page: p._id, views: p.count }));
      } catch (error) {
        console.error('GraphQL topPages error:', error);
        throw error;
      }
    },

    // Get top clicks
    async topClicks(_, { limit = 10 }, context) {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
            $limit: Math.min(limit, 50)
          }
        ]);

        return topClicks.map(c => ({ item: c._id, clicks: c.count }));
      } catch (error) {
        console.error('GraphQL topClicks error:', error);
        throw error;
      }
    },

    // Get device stats
    async deviceStats(_, args, context) {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const stats = await AnalyticsEvent.aggregate([
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

        return stats.map(s => ({ device: s._id, count: s.count }));
      } catch (error) {
        console.error('GraphQL deviceStats error:', error);
        throw error;
      }
    },

    // Get visitor info
    async visitorInfo(_, { visitorId }, context) {
      try {
        const events = await AnalyticsEvent.find({ visitorId })
          .sort({ createdAt: -1 });

        if (events.length === 0) return null;

        const pages = [...new Set(events.map(e => e.page))];

        return {
          visitorId,
          totalEvents: events.length,
          lastSeen: events[0].createdAt.toISOString(),
          device: events[0].device,
          pages
        };
      } catch (error) {
        console.error('GraphQL visitorInfo error:', error);
        throw error;
      }
    },

    // Get health status
    async health(_, args, context) {
      try {
        const uptime = process.uptime();
        
        return {
          status: 'healthy',
          mongodb: 'connected',
          redis: cacheService.initialized ? 'connected' : 'offline',
          uptime,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('GraphQL health error:', error);
        return {
          status: 'error',
          mongodb: 'error',
          redis: 'error',
          uptime: 0,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};
