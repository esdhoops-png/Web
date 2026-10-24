// Service worker de Racha HYROX: funciona sin conexión y se actualiza solo.
const V = "racha-hyrox-v1";
const NUCLEO = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== "racha-hyrox-fuentes").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate" || (u.origin === location.origin && /\.html$|\/$/.test(u.pathname))) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(x => x || caches.match("./"))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.open("racha-hyrox-fuentes").then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { if (res.ok || res.type === "opaque") c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
    return;
  }
  if (u.origin === location.origin) e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
