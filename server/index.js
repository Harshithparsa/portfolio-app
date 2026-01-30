require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');

const ipWhitelistMiddleware = require('./middleware/ipWhitelist');
const authAdminMiddleware = require('./middleware/authAdmin');
const rateLimitMiddleware = require('./middleware/rateLimit');
const { initializeWebSocket } = require('./websocket');
const { typeDefs, resolvers } = require('./graphql/schema');

const app = express();
const server = http.createServer(app);
const { io, broadcastVisitorEvent, broadcastVisitorCount } = initializeWebSocket(server, authAdminMiddleware);

// Expose broadcast functions for use in routes
global.socketIO = { broadcastVisitorEvent, broadcastVisitorCount };

// Trust proxy for correct IP detection behind reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('server/uploads'));

const ensureAdmin = require('./utils/ensureAdmin');

// MongoDB connection
// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is missing! App running in demo mode.');
} else {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(async () => {
    console.log('✅ MongoDB connected');
    await ensureAdmin();
  }).catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api', require('./routes/portfolio')); // Mount at base for /api/admin/... calls
app.use('/api/uploads', ipWhitelistMiddleware, require('./routes/uploads'));
app.use('/api/admin/analytics', authAdminMiddleware, require('./routes/admin-analytics'));
app.use('/api/portfolio/contact', require('./routes/contact'));
app.use('/api/dashboard', require('./routes/dashboard'));

// SEO Routes (sitemap, robots.txt)
app.use('/', require('./routes/seo'));
// ============================================
// 1. Admin page: Secret route, NO IP restriction
//    (public can access login, but APIs require IP + JWT)
const ADMIN_SECRET = process.env.ADMIN_SECRET_ROUTE || '/admin-parsa-7734';

// 2. IP whitelist for admin APIs ONLY
// This is now handled within the routes or via specific path middleware
// We've already mounted the portfolio routes at /api, so the middleware
// will be applied internally where appropriate in the portfolio router.

// Serve public portfolio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve admin dashboard at SECRET route (no IP restriction)
app.get(ADMIN_SECRET, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

// Also allow /admin for easier access in development
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

// Favicon fallback
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.svg'));
});

// Catch-all route for SPA support (serve index.html for SEO URLs like /projects, /skills)
app.get('*', (req, res) => {
  // Don't intercept API or GraphQL calls
  if (req.path.startsWith('/api') || req.path.startsWith('/graphql')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Log the secret admin route on startup
console.log(` SECRET ADMIN ROUTE: ${ADMIN_SECRET}`);

// ============================================
// GRAPHQL SETUP (Apollo Server)
// ============================================
(async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Check if request has admin token
      const token = req.headers.authorization?.split(' ')[1];
      return { token, req };
    }
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  console.log(` GraphQL playground: http://localhost:${process.env.PORT || 5000}/graphql`);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`🚀 PRODUCTION SERVER STARTED`);
    console.log(`📡 Listening on PORT: ${PORT}`);
    console.log(`🏠 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Admin Route: ${ADMIN_SECRET}`);
    console.log(`🔗 WebSocket: Enabled`);
    console.log('=================================');
  });
})();

process.on('SIGINT', async () => {
  console.log('\n✋ Shutting down...');
  process.exit(0);
});

module.exports = app;
