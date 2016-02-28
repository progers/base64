'use strict';
// Simple offline service worker.
//
// On the main page include:
//     if ('serviceWorker' in navigator)
//         navigator.serviceWorker.register('simple-offline-service-worker.js');
//
// This cache always requests from the network to keep the cache fresh. There is a tradeoff here
// because we'll wait ages for a slow network despite having a cached response ready to go.

var version = 'v1.0.2';

// Only cache the response from this directory. 'start_url' in manifest.json should also be './'
var offlineFiles = [ './' ];

self.addEventListener('install', function(event) {
    // Cache our list of files.
    event.waitUntil(caches.open(version).then(function(cache) { cache.addAll(offlineFiles); }));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(networkReponse) {
            // Check if this request is already in our cache. We only want to cache previously
            // cached items to prevent the cache from getting polluted.
            var clonedResponse = networkReponse.clone();
            caches.open(version).then(function(cache) {
                cache.match(event.request).then(function(previouslyCachedResponse) {
                    if (!previouslyCachedResponse)
                        return;
                    // Clone the response since we're also returning it below.
                    cache.put(event.request, clonedResponse);
                });
            });
            return networkReponse;
        }).catch(function(networkIssue) {
            // Return from the cache if available, or explode which will 404.
            return caches.match(event.request);
        })
    );
});
