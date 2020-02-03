import { precacheStaticAssets, removeUnusedCaches, ALL_CACHES_LIST, ALL_CACHES } from './sw/caches';
const FALLBACK_IMAGE_URL = 'https://localhost:3100/images/fallback-grocery.png'

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            // Cache fallback image
            caches.open(ALL_CACHES.fallbackImages).then(cache => {
                cache.add(FALLBACK_IMAGE_URL);
            }),
            // Populate manifest pre cache
            precacheStaticAssets(),
        ])
    )
})

self.addEventListener('activate', event => {
    // remove unused caches
    removeUnusedCaches(ALL_CACHES_LIST)
})

function serveCachedImage(fetchEvent) {
    return fetch(fetchEvent.request, { mode: 'cors', credentials: 'omit' })
        .then(response => {
            if (!response.ok) {
                return caches.match(FALLBACK_IMAGE_URL, { cacheName: ALL_CACHES.fallbackImages })
            } else {
                return response;
            }
        })
        .catch(() => {
            return caches.match(FALLBACK_IMAGE_URL, { cacheName: ALL_CACHES.fallbackImages })
        })
}

self.addEventListener('fetch', event => {
    const acceptHeaders = event.request.headers.get('accept');
    const requestUrl = new URL(event.request.url);

    event.respondWith(
        caches.match(event.request, { cacheName: ALL_CACHES.prefetch }).then(response => {
            if (response) return response;

            if (acceptHeaders.indexOf('image/*') >= 0) {
                if (requestUrl.pathname.indexOf('/images/' === 0)) {
                    return serveCachedImage(event);
                }
            }

            return fetch(event.request);
        })
    )

    
})
