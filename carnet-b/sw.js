// Service worker de Teórico B: funciona sin conexión y se actualiza solo.
const V = "teorico-b-v1";
const NUCLEO = ["./", "./index.html", "./preguntas.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("teorico-b-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  const propio = u.origin === location.origin, fuente = /fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (!propio && !fuente) return;
  // Primero la red (para recibir preguntas y cambios nuevos); sin conexión, la copia guardada.
  e.respondWith(fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r).then(x => x || (r.mode === "navigate" ? caches.match("./") : Response.error()))));
});
