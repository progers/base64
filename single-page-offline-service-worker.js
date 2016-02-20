// Very simple single page offline service worker.
//
// On the main page include:
//     if (!('serviceWorker' in navigator))
//         return;
//     navigator.serviceWorker.register('single-page-offline-service-worker.js');

'use strict';

// Version key for cache in case entries need to be removed in the future.
var version = 'v1.0.0';
var offlineFiles = [ '/', 'index.html' ];

self.addEventListener('install', function(event) {
    function cacheAllFiles(cache) {
        return cache.addAll(offlineFiles);
    }

    event.waitUntil(caches.open(version).then(cacheAllFiles));
});

// Delete stale cache entries on activation.
self.addEventListener('activate', function(event) {
    function removeStaleKeys(keys) {
        function keyNotEqual(key) {
            return key !== version;
        }
        function deleteKey(key) {
            return caches.delete(key);
        }
        return Promise.all(keys.filter(keyNotEqual).map(deleteKey));
    }

    event.waitUntil(caches.keys().then(removeStaleKeys));
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET')
        return;

    // Eventually fresh approach, see:
    // https://ponyfoo.com/articles/progressive-networking-serviceworker
    function eventuallyFreshResponse(cached) {
        function fetchedFromNetwork(response) {
            var cacheCopy = response.clone();
            caches.open(version).then(function add(cache) {
                cache.put(event.request, cacheCopy);
            });
            return response;
        }

        var networked = fetch(event.request).then(fetchedFromNetwork);
        return cached || networked;
    }

    event.respondWith(caches.match(event.request).then(eventuallyFreshResponse));
});
