// service-worker.js

// Installe le Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    // Une fois le Service Worker installé
    // On ouvre un nouveau cache
    caches.open("lsr-1")
    // Puis on y ajoute toutes les URLs à mettre en cache
    .then(cache => {
      return cache.addAll([
        "/",
        "cookies_min.js",
        "favicon.ico",
        "index.html",
        "le-score.css",
        "manifest.json",
        "normalize.css",
        "rummikub.js",
        "icons/android-chrome-192x192.png",
        "icons/android-chrome-512x512.png",
        "icons/apple-touch-icon.png",
        "icons/browserconfig.xml",
        "icons/favicon-16x16.png",
        "icons/favicon-32x32.png",
        "icons/mstile-150x150.png",
        "icons/rummikub-tile.png",
        "icons/rummikub.png",
        "icons/safari-pinned-tab.svg",
      ]);
    })
  );
});

// Utilise le Service Worker pour renvoyer l'URL demandée
self.addEventListener("fetch", (event) => {
  event.respondWith(
    // Commence par lire depuis le cache
    caches.match(event.request)
    // Puis lecture depuis internet en cas d'erreur
    .catch(function() {
      return fetch(event.request);
    })
  );
});
