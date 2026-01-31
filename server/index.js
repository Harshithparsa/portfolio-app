require('dotenv').config();
const express = require('express');
const http = require('http');
// const mongoose = require('mongoose'); // Removed
const cors = require('cors');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const sequelize = require('./database/db'); // Import Sequelize

// Pre-load models to ensure associations
require('./models');

const ipWhitelistMiddleware = require('./middleware/ipWhitelist');
const authAdminMiddleware = require('./middleware/authAdmin');
// const rateLimitMiddleware = require('./middleware/rateLimit'); // Optional
const { initializeWebSocket } = require('./websocket');

// GraphQL likely needs refactoring for SQL. Importing but may need updates.
const { typeDefs, resolvers } = require('./graphql/schema');

const app = express();
const server = http.createServer(app);
const { io, broadcastVisitorEvent, broadcastVisitorCount } = initializeWebSocket(server, authAdminMiddleware);

global.socketIO = { broadcastVisitorEvent, broadcastVisitorCount };

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('server/uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api', require('./routes/portfolio')); // support legacy /api/admin paths
app.use('/api/uploads', ipWhitelistMiddleware, require('./routes/uploads'));
// Analytics routes might need refactoring, keeping them mounted but they might fail if not updated
app.use('/api/admin/analytics', authAdminMiddleware, require('./routes/admin-analytics'));
app.use('/api/portfolio/contact', require('./routes/contact'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/', require('./routes/seo'));

const ADMIN_SECRET = process.env.ADMIN_SECRET_ROUTE || '/admin-parsa-7734';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get(ADMIN_SECRET, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.svg'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/graphql')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Database & Server Startup
const ensureAdmin = require('./utils/ensureAdmin');

(async () => {
  try {
    // Connect to SQL
    await sequelize.authenticate();
    console.log('✅ SQLite Database connected successfully.');

    // Sync models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced.');

    // Create admin user if needed
    await ensureAdmin();

    // Start GraphQL (might need fixes used Mongoose)
    // For now, wrapping in try/catch to avoid crash if schema is broken
    try {
      const apolloServer = new ApolloServer({
        typeDefs,
        resolvers, // These need to be updated to use Sequelize!
        context: ({ req }) => {
          const token = req.headers.authorization?.split(' ')[1];
          return { token, req };
        }
      });
      await apolloServer.start();
      apolloServer.applyMiddleware({ app, path: '/graphql' });
      console.log(`✅ GraphQL initialized`);
    } catch (gqlErr) {
      console.warn('⚠️ GraphQL failed to start (likely Mongoose dependency):', gqlErr.message);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔧 Admin Route: ${ADMIN_SECRET}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
})();
