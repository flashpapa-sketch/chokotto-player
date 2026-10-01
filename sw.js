/* 一度開けば、電波がなくても起動できるようにする（曲は保存しない） */
const CACHE = 'ck-a3e37f4595a4';
const FILES = ["./", "app/about.html", "app/cd.html", "app/eq.html", "app/fonts.css", "app/index.html", "app/options.html", "app/playlist.html", "app/skin-apply.js", "app/skin-vars.css", "app/skin-windows.css", "app/skins/braun/main.css", "app/skins/braun/options.css", "app/skins/braun/skin.json", "app/skins/cassette/main.css", "app/skins/cassette/skin.json", "app/skins/denim/main.css", "app/skins/denim/skin.json", "app/skins/gameboy/main.css", "app/skins/gameboy/skin.json", "app/skins/hifi/main.css", "app/skins/hifi/skin.json", "app/skins/index.json", "app/skins/kabuki/main.css", "app/skins/kabuki/skin.json", "app/skins/kawaii/main.css", "app/skins/kawaii/skin.json", "app/skins/nocturne/main.css", "app/skins/nocturne/skin.json", "app/skins/porcelain/main.css", "app/skins/porcelain/skin.json", "app/skins/signal/main.css", "app/skins/signal/skin.json", "app/skins/swiss/main.css", "app/skins/swiss/skin.json", "app/skins/vapor/main.css", "app/skins/vapor/skin.json", "app/skins/wa/main.css", "app/skins/wa/options.css", "app/skins/wa/skin.json", "app/skins/win98/main.css", "app/skins/win98/options.css", "app/skins/win98/skin.json", "app/skins/y2k/main.css", "app/skins/y2k/options.css", "app/skins/y2k/skin.json", "app/theme.css", "app/video.html", "app/web-api.js", "app/winamp-skin.js", "apple-touch-icon.png", "ck-meta.js", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "index.html", "manifest.webmanifest", "shell.js"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  })));
});
