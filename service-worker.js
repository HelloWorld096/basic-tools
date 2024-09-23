const FONT_CACHE_NAME = 'font-cache-v1';  // Define the cache for fonts
const FONT_ASSETS = [
  'https://fonts.gstatic.com/s/syne/v12/8QINdiTqQgA1BgeIAU8OxxNO.woff2',
  'https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg69CK48gW7PXooxjYp.woff2',
  'https://fonts.gstatic.com/s/kanit/v9/nKKU-Go6G5tXcraTRxJjZw.woff2'
];

// Install event - caching only the font files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FONT_CACHE_NAME)
      .then((cache) => {
        console.log('Caching font files');
        return cache.addAll(FONT_ASSETS);  // Cache the font files
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - don't remove font caches
self.addEventListener('activate', (event) => {
  // No cache clearing here to preserve font cache
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve font files from cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if the request is for a font file
  if (FONT_ASSETS.includes(url.href)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;  // Return the cached font
        }

        return fetch(event.request).then((response) => {
          return caches.open(FONT_CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());  // Cache the fetched font
            return response;
          });
        });
      })
    );
  }
});
