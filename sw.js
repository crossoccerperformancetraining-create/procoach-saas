const CACHE_NAME = 'procoach-max-v144';
const urlsToCache = [
    './',
    './index.html',
    './atleta.html',
    './logo.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
