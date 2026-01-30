// ============================================
// WEBSOCKET SERVER FOR REAL-TIME ANALYTICS
// ============================================

const socketIO = require('socket.io');

function initializeWebSocket(server, authAdminMiddleware) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store active connections
  const adminConnections = new Map();
  const visitorConnections = new Map();

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      // Admin connection
      socket.isAdmin = true;
    }
    next();
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`[WebSocket] ${socket.isAdmin ? 'Admin' : 'Visitor'} connected: ${socket.id}`);

    if (socket.isAdmin) {
      adminConnections.set(socket.id, socket);
      socket.on('request-live-analytics', () => {
        socket.emit('request-acknowledged', { message: 'Listening for live updates' });
      });
    } else {
      visitorConnections.set(socket.id, socket);
    }

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`[WebSocket] ${socket.isAdmin ? 'Admin' : 'Visitor'} disconnected: ${socket.id}`);
      adminConnections.delete(socket.id);
      visitorConnections.delete(socket.id);
    });
  });

  // Function to broadcast event to all admin connections
  function broadcastToAdmins(eventName, data) {
    adminConnections.forEach((socket) => {
      socket.emit(eventName, data);
    });
  }

  // Function to broadcast visitor event to admins (real-time)
  function broadcastVisitorEvent(event) {
    broadcastToAdmins('visitor-event', {
      type: event.type, // page_view, click, download
      page: event.page,
      item: event.item,
      device: event.device,
      timestamp: new Date(),
      visitorId: event.visitorId?.substring(0, 8) // Anonymized
    });
  }

  // Function to broadcast visitor count update
  function broadcastVisitorCount(count) {
    broadcastToAdmins('visitor-count-update', {
      activeVisitors: visitorConnections.size,
      totalVisitors: count,
      timestamp: new Date()
    });
  }

  return {
    io,
    broadcastToAdmins,
    broadcastVisitorEvent,
    broadcastVisitorCount
  };
}

module.exports = { initializeWebSocket };
