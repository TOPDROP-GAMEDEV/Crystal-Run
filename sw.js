/* Offline support. Network-first so an updated course is never served stale,
   with the cache as the fallback when there is no connection. */
const CACHE = 'crystal-run-v5';
const ASSETS = [
  './', 'index.html', 'css/style.css',
  'js/minijava.js', 'js/course.js', 'js/glossary.js', 'js/explain.js', 'js/tutor.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => null)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && new URL(req.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html')))
  );
});
