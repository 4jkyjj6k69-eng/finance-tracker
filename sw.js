const CACHE_NAME = "finance-tracker-v1";
 
const URLS_TO_CACHE = [
  "/finance-tracker/",
  "/finance-tracker/index.html",
  "/finance-tracker/manifest.json",
  "/finance-tracker/icon-192.png",
  "/finance-tracker/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
];
 
// Installation: alles in den Cache laden
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Cache wird befüllt");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});
 
// Aktivierung: alten Cache löschen
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
 
// Anfragen: erst Cache, dann Netzwerk
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Erfolgreiche Antworten in Cache speichern
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline-Fallback
        if (event.request.destination === "document") {
          return caches.match("/finance-tracker/index.html");
        }
      });
    })
  );
});
 
