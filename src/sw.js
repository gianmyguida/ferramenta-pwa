import { precacheAndRoute } from 'workbox-precaching';

// Precache di tutti gli asset dell'app (JS, CSS, immagini) generato automaticamente
// dal plugin in fase di build, a partire da injectManifest.globPatterns
precacheAndRoute(self.__WB_MANIFEST);

const OFFLINE_URL = '/offline.html';
const CACHE_NAME = 'offline-cache-v1';

//In fase di installazione, salviamo la pagina di fallback nella cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

//Nella fase di fetch, se la rete fallisce durante una navigazione, restituiamo la pagina di fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Proviamo sempre la rete per prima cosa
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch scatta solo se la fetch fallisce per davvero (rete assente),
          // non per risposte 4xx/5xx del server, che non lanciano eccezione
          console.log('Fetch fallita; restituisco la pagina offline.', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }
});

// 3. Notifiche push VERE: il browser risveglia questo Service Worker anche
// se l'app è chiusa, quando il server invia un messaggio push
self.addEventListener('push', (event) => {
  let data = { title: 'Ferramenta', body: 'Hai una nuova notifica.' };
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Errore nel parsing dei dati push:', error);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
    })
  );
});

// 4. Click sulla notifica: porta l'utente sull'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});

