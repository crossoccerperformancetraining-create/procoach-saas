const CACHE_NAME = 'procoach-cache-v203';
const CORE = ['/index.html?v=203', '/atleta.html?v=203', '/athlete-start.html?v=203', '/manifest.json?v=203', '/athlete-manifest.json?v=203'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('procoach') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    const isAthleteStart = url.pathname.endsWith('/athlete-start.html');
    const isAthlete = url.pathname.endsWith('/atleta.html');
    const offlineShell = isAthleteStart ? '/athlete-start.html?v=203' : (isAthlete ? '/atleta.html?v=203' : '/index.html?v=203');
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match(offlineShell)))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
