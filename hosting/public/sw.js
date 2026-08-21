self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([
  caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x)))),
  self.registration.unregister(),
  self.clients.claim()
])));