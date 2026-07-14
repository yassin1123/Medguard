/*
 * MedGuard service worker.
 *
 * Strategy: cache-first for the app shell so MedGuard opens instantly and
 * works with no connection at all. The dataset is part of the shell, so once
 * the app has loaded once, it keeps working on a plane, in a basement, or
 * during an outage — which is the whole point of this tool.
 *
 * Bump CACHE_VERSION whenever shell files change to retire the old cache.
 */

const CACHE_VERSION = 'medguard-v1';

const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './icon.svg',
  './manifest.webmanifest',
  './vendor/core/index.js',
  './vendor/core/engine.js',
  './vendor/core/severity.js',
  './vendor/core/normalize.js',
  './vendor/core/validate.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Cache same-origin successes so repeat visits stay fast/offline.
          if (response.ok && new URL(request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
