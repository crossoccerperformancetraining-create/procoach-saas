const VERSION='204';
const STATIC_CACHE=`procoach-static-v${VERSION}`;
const RUNTIME_CACHE=`procoach-runtime-v${VERSION}`;
const CORE=['/','/index.html?v=204','/atleta.html?v=204','/athlete-start.html?v=204','/manifest.json?v=204','/athlete-manifest.json?v=204','/logo.png?v=204'];
const CDN_HOSTS=new Set(['cdn.tailwindcss.com','www.gstatic.com','cdnjs.cloudflare.com','cdn.onesignal.com']);
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(STATIC_CACHE).then(async cache=>{for(const url of CORE){try{await cache.add(url)}catch(_){}}}))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('procoach-')&&!([STATIC_CACHE,RUNTIME_CACHE,'procoach-athlete-identity-v2'].includes(k))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const cachePut=async(req,res,cacheName=RUNTIME_CACHE)=>{if(!res)return res;try{const cache=await caches.open(cacheName);await cache.put(req,res.clone())}catch(_){}return res};
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(req.mode==='navigate'){
  event.respondWith((async()=>{try{const fresh=await fetch(req);cachePut(req,fresh);return fresh}catch(_){const exact=await caches.match(req);if(exact)return exact;const athlete=url.pathname.endsWith('/atleta.html')||url.pathname.endsWith('/athlete-start.html');return (await caches.match(athlete?'/athlete-start.html?v=204':'/index.html?v=204'))||Response.error()}})());return;
 }
 if(url.origin===self.location.origin){event.respondWith((async()=>{const cached=await caches.match(req);const network=fetch(req).then(r=>cachePut(req,r)).catch(()=>null);return cached||await network||Response.error()})());return;}
 if(CDN_HOSTS.has(url.hostname)){event.respondWith((async()=>{try{return await cachePut(req,await fetch(req))}catch(_){return (await caches.match(req))||Response.error()}})())}
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
