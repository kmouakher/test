var CACHE_NAME = 'trombi-offline-cache-v2';
var filestoCache  = [
  '/index.html',
  '/css/pageslider.css',
  '/css/styles.css',
  '/pics/undefined.jpg',
  '/js/app.js',
  '/js/data.js',
  '/js/pageslider-react.js',
  '/js/router.js',
  '/map/leaflet-src.js',
  '/map/leaflet.css'
];

self.addEventListener('install', function(event) {
    console.log('install service worker...');
    self.skipWaiting();

    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            cache.addAll(filestoCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('fetch service worker...');
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have 2 stream.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
