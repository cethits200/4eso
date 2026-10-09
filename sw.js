const C='daniela4eso-v12-6';
const A=['./','./index.html','./hucha_8_cabecera.jpg','./latin_tema1_infografia_V11.jpg','./ingles_tema1_infografia_V11.jpg','./mates_tema1_infografia_V11.jpg','./lengua_tema1_infografia_V11.jpg','./geo_tema1_infografia_V11.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp.ok&&e.request.url.startsWith(self.location.origin)){const copy=resp.clone();caches.open(C).then(c=>c.put(e.request,copy))}return resp}))) });
