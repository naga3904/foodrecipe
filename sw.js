const staticCacheName = 'site-static-v6';//we have change the name every time we make changes in cached files
const dynamicCache = 'site-dynamic-v2';
const cached_array = ['/index.html',
'https://fonts.gstatic.com/s/materialicons/v83/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
'/js/app.js',
'/js/materialize.min.js',
'/pages/fallback.html',
'/js/ui.js',
'/css/materialize.min.css',
'/css/style.css',
'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/preview',
'https://fonts.googleapis.com/icon?family=Material+Icons'
];
//install service worker
self.addEventListener('install',(evt)=>{
    evt.waitUntil(caches.open(staticCacheName).then((cache)=>{
        cache.addAll(cached_array);
    }));
    self.skipWaiting()
});

//cache size limit function
const limitCachesize = (name,size)=>{
    caches.open(name).then(cache=>{
        cache.keys().then(keys=>{
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCachesize(name,size));
            }
        })
    })
};

//activate event
self.addEventListener('activate',(evt)=>{
    evt.waitUntil(caches.keys().then((keys)=>{
        return Promise.all(keys.filter(key => key !== staticCacheName && key !== dynamicCache)
        .map(key => caches.delete(key)));
    }));
});

//fetch event
self.addEventListener('fetch',(evt)=>{
    evt.respondWith(
        caches.match(evt.request).then((cacheRes)=>{
            return cacheRes || fetch(evt.request).then((fetchRes)=>{
                return caches.open(dynamicCache).then((cache) =>{
                    cache.put(evt.request.url,fetchRes.clone());
                    limitCachesize(dynamicCache,15);
                    return fetchRes;
                })
            })
        }).catch(()=>{
            //here in conditional fallback it checks wether file that is not loading is an html page, if its not an html page then it will return the value -1
            if(evt.request.url.indexOf('.html') > -1){
                return caches.match('/pages/fallback.html');
            }
        }
));         
});
