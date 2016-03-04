'use strict';
// Simple offline service worker.
//
// On the main page include:
//     if ('serviceWorker' in navigator)
//         navigator.serviceWorker.register('simple-offline-service-worker.js');
//
// This cache always requests from the network to keep the cache fresh. There is a tradeoff here
// because it'll wait ages for a slow network despite having a cached response ready to go. If stale
// content is acceptable, use an 'eventually fresh' approach as described by Jake Archibald or
// Nicolás Bevacqua in https://ponyfoo.com/articles/progressive-networking-serviceworker

var version = 'v4.2.0';

// To cache https://yoururl/subdirectory/ without listing index.html, use './'. If using a manifest,
// 'start_url' should also be './'. You can also add additional files to this list.
var offlineFiles = [ './' ];

self.addEventListener('install', function(event) {
    // Cache our list of files.
    event.waitUntil(
        caches.open(version).then(function(cache) {
            return cache.addAll(offlineFiles).then(function() {
                return self.skipWaiting();
            });
        })
    );
});

// Remove any stale cache entries.
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(key) {
                if (key !== version)
                    return caches.delete(key);
            }));
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        // FIXME: We should send off the fetch request and check the cache in parallel.
        fetch(event.request).then(function(networkReponse) {
            // Check if this request is already in our cache. We only want to cache previously
            // cached items to prevent the cache from getting polluted.
            return caches.open(version).then(function(cache) {
                return cache.match(event.request).then(function(cachedResponse) {
                    if (!cachedResponse)
                        return networkReponse;
                    // Clone the response since we're also returning it below.
                    cache.put(event.request, networkReponse.clone());
                    return networkReponse;
                });
            });
        }).catch(function(networkError) {
            return caches.open(version).then(function(cache) {
                return cache.match(event.request).then(function(cachedResponse) {
                    return cachedResponse || networkError;
                });
            });
        })
    );
});
