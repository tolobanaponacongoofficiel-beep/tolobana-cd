// Service worker minimal : page hors-ligne + mise en cache des fichiers statiques. Rien de privé n'est mis en cache.
const V = 'tolobana-v1', OFFLINE = '/offline'
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll([OFFLINE, '/logo.png'])).then(() => self.skipWaiting()))
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', e => {
  const r = e.request
  if (r.method !== 'GET') return
  const u = new URL(r.url)
  if (u.origin !== location.origin) return
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match(OFFLINE))); return }
  if (u.pathname.startsWith('/_next/static/') || u.pathname.startsWith('/icons/')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res })))
  }
})
