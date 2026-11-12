// Service worker de 5 Mentarios Social Hub:
// - instala la app (PWA) y la abre sin conexión con la última versión descargada
// - recibe notificaciones push y abre la pantalla correcta al pulsarlas
const CACHE = 'social-hub-v1';
const SHELL = [
  './', './index.html', './styles.css', './config.js', './manifest.webmanifest',
  './vendor/preact.module.js', './vendor/hooks.module.js', './vendor/htm.module.js', './vendor/supabase.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-64.png', './icons/5mentarios-sello.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para los ficheros propios (así siempre se ve la última versión);
// si no hay conexión se usa la copia guardada. Las llamadas a Supabase/Google no se tocan.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/media/')) return; // vídeos grandes: directos de la red, sin guardarlos en caché
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});

self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Social Hub', body: e.data && e.data.text() }; }
  const title = data.title || '5 Mentarios Social Hub';
  e.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/favicon-64.png',
    tag: data.id || undefined,
    data: { link: data.link || '#/notificaciones' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || '#/notificaciones';
  const target = new URL('./' + link, self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) { await c.focus(); c.navigate(target); return; }
    }
    await self.clients.openWindow(target);
  })());
});
