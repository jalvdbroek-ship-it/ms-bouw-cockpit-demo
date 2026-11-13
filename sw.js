// Service worker van de preview: de app-schil komt uit de cache, zodat de app ook zonder bereik opent.
// Gegevens staan in deze preview in localStorage; in de MVP komt hier een wachtrij in IndexedDB bij.
const CACHE = 'msbc-preview-v1';
const SCHIL = ['./', 'index.html', 'app.css', 'data.js', 'kern.js', 'schermen-a.js', 'schermen-b.js', 'schermen-c.js', 'manifest.webmanifest',
  'assets/fonts/young-serif-latin.woff2', 'assets/fonts/hanken-grotesk-latin.woff2', 'assets/img/icon-192.png',
  'assets/img/bad-dakschuin-voor-800.webp', 'assets/img/trap-eiken-voor-640.webp', 'assets/img/trap-donker-voor-640.webp', 'assets/img/trap-donker-tussen-640.webp', 'assets/img/trap-donker-na-640.webp'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SCHIL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // eerst het netwerk (altijd de nieuwste versie), bij geen bereik de cache
  e.respondWith(fetch(e.request).then((r) => { const kopie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, kopie)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
});
