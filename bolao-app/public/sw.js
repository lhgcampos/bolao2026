const CACHE_NAME = 'bolao2026-pwa-v9';
const scopePath = new URL(self.registration.scope).pathname;
const APP_SHELL = [
  scopePath,
  `${scopePath}index.html`,
  `${scopePath}manifest.webmanifest`,
  `${scopePath}icons/icon-192.png`,
  `${scopePath}icons/icon-512.png`,
  `${scopePath}icons/maskable-512.png`,
  `${scopePath}icons/apple-touch-icon.png`
];

const isAppRuntimeAsset = (requestUrl) => {
  if (!requestUrl.pathname.startsWith(scopePath)) return false;
  return ['.js', '.css', '.html', '.webmanifest'].some((extension) => requestUrl.pathname.endsWith(extension));
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  if (!isSameOrigin) return;

  const isNavigation = event.request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(scopePath, copy));
          return response;
        })
        .catch(() => caches.match(scopePath))
    );
    return;
  }

  if (isAppRuntimeAsset(requestUrl)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok || response.type !== 'basic') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (!response.ok || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
