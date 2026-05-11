/* Camino Companion · Service Worker
   Caching strategy:
   - App shell (HTML, manifest, icons): cache-first
   - Leaflet CDN + Google Fonts: cache-first
   - OSM map tiles: stale-while-revalidate (so previously seen tiles work offline)
   - Overpass API: network-only (always fresh)
*/
const VERSION = 'camino-v1.3.1';
const SHELL_CACHE = `${VERSION}-shell`;
const TILES_CACHE = `${VERSION}-tiles`;
const STATIC_CACHE = `${VERSION}-static`;

const SHELL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './route.json',
  './features.json',
  './itinerary.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(c => c.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Don't cache POSTs (Overpass uses POST) — go to network
  if (e.request.method !== 'GET') return;

  // OSM map tiles — stale-while-revalidate
  if (url.hostname.endsWith('tile.openstreetmap.org')){
    e.respondWith(staleWhileRevalidate(e.request, TILES_CACHE, 5000));
    return;
  }

  // Leaflet CDN + Google Fonts — cache-first
  if (url.hostname === 'unpkg.com' ||
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com'){
    e.respondWith(cacheFirst(e.request, STATIC_CACHE));
    return;
  }

  // Overpass API and Open-Meteo — always network (live data)
  if (url.hostname.includes('overpass') || url.hostname.includes('open-meteo')){
    return; // default network behavior
  }

  // Same-origin (app shell) — cache-first with network fallback
  if (url.origin === location.origin){
    e.respondWith(cacheFirst(e.request, SHELL_CACHE));
    return;
  }
});

function cacheFirst(req, cacheName){
  return caches.open(cacheName).then(cache =>
    cache.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
}

function staleWhileRevalidate(req, cacheName, maxEntries){
  return caches.open(cacheName).then(cache => {
    const cachedPromise = cache.match(req);
    const networkPromise = fetch(req).then(res => {
      if (res && res.status === 200){
        cache.put(req, res.clone());
        if (maxEntries) trimCache(cacheName, maxEntries);
      }
      return res;
    }).catch(() => null);
    return cachedPromise.then(cached => cached || networkPromise);
  });
}

async function trimCache(cacheName, maxEntries){
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries){
    for (let i = 0; i < keys.length - maxEntries; i++){
      await cache.delete(keys[i]);
    }
  }
}
