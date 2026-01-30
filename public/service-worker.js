// Service Worker for PWA support
// Bump cache name when changing caching logic.
const CACHE_NAME = 'portfolio-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/styles.css',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📝 Caching app shell');
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn('⚠️ Some resources failed to cache:', error);
        // Continue even if some fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network-only (avoid stale cached API responses)
  if (url.pathname.startsWith('/api/') || url.pathname === '/graphql') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Offline - return a helpful error (API should not be cached)
          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        })
    );
  } 
  // Static assets - cache-first strategy
  else if (
    request.method === 'GET' &&
    (url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.jpg') ||
     url.pathname.endsWith('.svg') ||
     url.pathname.endsWith('.woff') ||
     url.pathname.endsWith('.woff2') ||
     url.pathname.endsWith('.ttf'))
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          console.log(`💾 Cached asset: ${url.pathname}`);
          return response;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  } 
  // HTML pages - network-first strategy
  else if (request.method === 'GET' && url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});

// Background sync for contact form (when offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contact') {
    event.waitUntil(
      syncContactForms()
        .then(() => {
          console.log('✉️ Contact forms synced');
        })
        .catch(() => {
          console.log('❌ Contact sync failed');
        })
    );
  }
});

async function syncContactForms() {
  // Retrieve pending contact forms from IndexedDB
  // and submit them when back online
  // Implementation depends on how you store pending requests
  console.log('🔄 Syncing pending contact forms...');
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon-192.png',
    badge: '/favicon-96.png',
    tag: 'portfolio-notification',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Portfolio', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if window already open
      for (let client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

console.log('✅ Service Worker loaded');
