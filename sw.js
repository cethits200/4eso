const C='daniela4eso-v12-8';
const A=['./','./index.html'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('daniela4eso-')&&k!==C).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.mode==='navigate'){
  e.respondWith(fetch(new Request(req,{cache:'no-store'})).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(C).then(c=>c.put('./index.html',copy))}return resp}).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{if(resp.ok&&req.url.startsWith(self.location.origin)){const copy=resp.clone();caches.open(C).then(c=>c.put(req,copy))}return resp})));
});
