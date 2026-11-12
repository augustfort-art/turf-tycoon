const CACHE = 'turf-tycoon-v28';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const APP = new URL('./', self.location).href, PAGE = new URL('./index.html', self.location).href;

// install: fetch fresh copies; only a complete, good set replaces the old version
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    for (const u of CORE) { const r = await fetch(new Request(u, { cache: 'reload' })); if (!r.ok) throw new Error('precache ' + u + ' ' + r.status); await c.put(u, r); }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

// the saved copy of the game page, whatever URL the app was opened with
async function cachedPage() {
  const c = await caches.open(CACHE);
  return (await c.match(PAGE)) || (await c.match(APP)) || (await caches.match(PAGE, { ignoreSearch: true })) || (await caches.match(APP, { ignoreSearch: true }));
}
// network with a time limit, so a weak signal doesn't hang the launch
function net(url, ms) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    fetch(new Request(url, { cache: 'no-cache', credentials: 'same-origin' })).then(r => { clearTimeout(t); res(r); }, err => { clearTimeout(t); rej(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(req); if (hit) return hit; try { const r = await fetch(req); if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; } catch (err) { return new Response('', { status: 504 }); } }));
    return;
  }
  if (url.origin !== location.origin) return;

  // opening the app: newest page when online, saved page when offline (or the network is too slow / erroring)
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await net(url.origin + url.pathname, 4000);
        if (r.ok && !r.redirected) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(PAGE, copy)); return r; }
        if (r.ok) return new Response(await r.blob(), { headers: r.headers }); // Safari won't show a redirected response from a worker
        const saved = await cachedPage(); return saved || r;
      } catch (err) {
        const saved = await cachedPage(); if (saved) return saved;
        return new Response('<h1>Offline</h1><p>Open Turf &amp; Tycoon once with a connection so it can save itself for offline play.</p>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // everything else: network first, saved copy as fallback; never save error pages
  e.respondWith(fetch(req).then(r => { if (r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.destination === 'document' ? cachedPage() : undefined)).then(r => r || new Response('', { status: 504 }))));
});
