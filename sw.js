/* Cauvery Delta Metro Service Worker - PWA Offline Support */
const CACHE_NAME = 'cauvery-metro-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: Cache core application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate with Network Fallback
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            // Only cache http/https
            if (req.url.startsWith('http')) {
              cache.put(req, responseToCache);
            }
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and request is an HTML page navigation, return index.html
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return cached;
      });

      return cached || fetchPromise;
    })
  );
});
