// Service Worker for Nijuze - Network First / Fresh Cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh content from network in development/dynamic mode
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
