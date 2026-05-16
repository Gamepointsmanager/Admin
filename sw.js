// SweepAdmin Backend Service Worker — v2
const CACHE = 'sweepadmin-backend-v2';
const SHELL = ['./index.html', './'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match('./index.html');
        const fetchPromise = fetch(req).then(res => {
          if (res.ok) cache.put('./index.html', res.clone());
          return res;
        }).catch(() => null);
        return cached || fetchPromise;
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || fetchPromise;
    })
  );
});
