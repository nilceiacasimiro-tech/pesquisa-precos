/* Pesquisa de Preços – service worker
   Sempre busca a versão nova na internet; a cópia guardada só é usada sem internet.
   Não guarda nada do Supabase (login, pesquisa e fotos). */
const CACHE = "pesquisa-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png", "./icone-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;   // só arquivos do próprio site
  e.respondWith(
    fetch(r, { cache: "no-cache" }).then(res => {
      if (res.ok && res.type === "basic") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
