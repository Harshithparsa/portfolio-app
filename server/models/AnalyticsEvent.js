const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['page_view', 'click', 'download'],
    required: true,
    index: true
  },
  page: {
    type: String,
    required: true
  },
  item: String, // resume, cv, github, linkedin, etc.
  referrer: String,
  device: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    default: 'desktop'
  },
  userAgent: String, // simplified browser info
  ip: String, // optional, server-side only
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // Auto-delete after 90 days
  }
});

// Compound index for efficient queries
analyticsEventSchema.index({ visitorId: 1, createdAt: -1 });
analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ page: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
