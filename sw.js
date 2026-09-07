const VERSION='209';
const STATIC_CACHE=`procoach-static-v${VERSION}`;
const RUNTIME_CACHE=`procoach-runtime-v${VERSION}`;
const CORE=[
  '/','/index.html?v=209','/atleta.html?v=209','/athlete-start.html?v=209',
  '/manifest.json?v=209','/athlete-manifest.json?v=209','/logo.png?v=209'
];
const CDN_HOSTS=new Set(['cdn.tailwindcss.com','www.gstatic.com','cdnjs.cloudflare.com','cdn.onesignal.com']);
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(STATIC_CACHE).then(async cache=>{
    for(const url of CORE){try{await cache.add(url)}catch(_){}}
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('procoach-')&&!([STATIC_CACHE,RUNTIME_CACHE,'procoach-athlete-identity-v2'].includes(k))).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
const cachePut=async(req,res,cacheName=RUNTIME_CACHE)=>{
  if(!res)return res;try{const c=await caches.open(cacheName);await c.put(req,res.clone())}catch(_){}return res;
};
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        cachePut(req,fresh);return fresh;
      }catch(_){
        const exact=await caches.match(req);if(exact)return exact;
        if(url.pathname.endsWith('/atleta.html')) return (await caches.match('/atleta.html?v=209'))||Response.error();
        if(url.pathname.endsWith('/athlete-start.html')) return (await caches.match('/athlete-start.html?v=209'))||Response.error();
        return (await caches.match('/index.html?v=209'))||Response.error();
      }
    })());return;
  }
  if(url.origin===self.location.origin){
    event.respondWith((async()=>{
      try{return await cachePut(req,await fetch(req,{cache:'no-cache'}))}
      catch(_){return (await caches.match(req))||Response.error()}
    })());return;
  }
  if(CDN_HOSTS.has(url.hostname)){
    event.respondWith((async()=>{
      const cached=await caches.match(req);
      if(cached){fetch(req).then(r=>cachePut(req,r)).catch(()=>{});return cached;}
      try{return await cachePut(req,await fetch(req))}catch(_){return Response.error()}
    })());
  }
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});