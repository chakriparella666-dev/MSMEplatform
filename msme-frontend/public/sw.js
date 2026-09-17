const CACHE_NAME = 'msmemarket-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always fetch fresh for API requests and page navigations
  if (event.request.url.includes('/api/') || event.request.mode === 'navigate') {
    return;
  }

  // Network first with cache fallback for static assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
