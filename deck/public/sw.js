// sw.js · the deck keeps working with no network after the first visit 📴
// pages: network first, cached copy when offline · files: cached copy first, refreshed in the background · /api/ never cached
const V = 'sf60-__BUILD__';
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', ...__ASSETS__];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const keep = (req, res) => { if (res.ok || res.type === 'opaque') caches.open(V).then(c => c.put(req, res.clone())); return res; };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => keep('./', res)).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const fresh = fetch(req).then(res => keep(req, res)).catch(() => hit);
    return hit || fresh;
  }));
});
