const cacheName = 'v2';

// Install Event
self.addEventListener('install', e => {
});

// Activate Event
self.addEventListener('activate', e => {
  // delete unwanted caches
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // clone of response
        const resClone = res.clone();
        // Open cahce
        caches.open(cacheName).then(cache => {
          // Add response to cache
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(err => caches.match(e.request).then(res => res))
  );
});
