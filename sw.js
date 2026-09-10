const CACHE="wolf-stream-v1";
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","index.html","style.css","app.js","manifest.webmanifest","assets/wolf-stream-logo.jpg"]))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
