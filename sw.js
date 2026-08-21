/* VANI Service Worker — Seiten frisch aus dem Netz, offline aus dem sicheren Cache. */
const VERSION = '5.7.0';
const CACHE = 'vani-v5-' + VERSION;
const KERN = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(KERN)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      if (res && res.ok) caches.open(CACHE).then((c) => c.put('./index.html', res.clone()));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const frisch = fetch(req).then((res) => {
      if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => hit);
    return hit || frisch;
  }));
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.typ === 'VERSION' && e.source) e.source.postMessage({ typ: 'VERSION', version: VERSION });
  if (e.data && e.data.typ === 'AKTIVIEREN') self.skipWaiting();
});
