const CACHE_NAME = 'procoach-v65-routines-player';
const APP_SHELL = ['./', './index.html', './atleta.html', './manifest.webmanifest', './athlete-manifest.webmanifest', './procoach-icon.svg', './procoach-fcm-config.js'];

try {
  importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: 'AIzaSyBURvWmrRe-q-l1h2XKaQepeRQoNcmi7nk',
    authDomain: 'procoachoficial.firebaseapp.com',
    projectId: 'procoachoficial',
    storageBucket: 'procoachoficial.firebasestorage.app',
    messagingSenderId: '128403842399',
    appId: '1:128403842399:web:c54259e2b6a5622fb942ea'
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const notification = payload.notification || {};
    return self.registration.showNotification(notification.title || 'ProCoach Athlete V6.5', {
      body: notification.body || 'Você tem uma nova atualização.',
      icon: './procoach-icon.svg',
      badge: './procoach-icon.svg',
      data: payload.fcmOptions && payload.fcmOptions.link || payload.data && payload.data.url || './atleta.html'
    });
  });
} catch (e) {}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html'))));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || './atleta.html'));
});
