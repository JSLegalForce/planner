/* JS Legal Force – Contactmanager PRO offline cache.
   Alleen eigen caches en eigen URL-pad beheren; laat andere JS Legal Force-apps intact. */
const PREFIX='jslf-cm-';
const CACHE='jslf-cm-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const scopePath=new URL(self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))
  ).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(scopePath)) return;

  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{});
      }
      return response;
    }).catch(()=>caches.open(CACHE).then(cache=>cache.match('./index.html'))));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const hit=await cache.match(request);
    if(hit) return hit;
    const response=await fetch(request);
    if(response.ok) cache.put(request,response.clone()).catch(()=>{});
    return response;
  }));
});
