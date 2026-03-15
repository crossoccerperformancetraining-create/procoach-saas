const CACHE_NAME = 'procoach-offline-v2';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('firestore.googleapis') || event.request.url.includes('identitytoolkit')) {
        return; 
    }
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) { return cachedResponse; }
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(() => {});
        })
    );
});
