/* 兰斋丛编 Service Worker
 * 策略：页面「网络优先」（保证软件列表实时更新），静态资源「缓存优先」（离线可看）。
 * 改版本号即可让旧缓存整体失效。 */
const CACHE = 'lanzhai-v3';
const CORE = ['./', './index.html', './manifest.json',
              './icon-192.png', './icon-512.png',
              './promo/lanzhai-promo-poster.jpg'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(CORE); })
      .catch(function(){ /* 单个资源 404 不该拖垮安装 */ })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; })
                             .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch(_) { return; }
  if(url.origin !== self.location.origin) return;    // 统计 / GitHub 等第三方不插手

  /* 媒体（宣传片 mp4 等）：不拦截、不缓存
   * 一是 14MB 不该塞进 CacheStorage；二是 SW 插手会让 Range 请求异常、拖不动进度条 */
  if(req.destination === 'video' || req.destination === 'audio'
     || /\.(mp4|webm|m4a|ogg)$/i.test(url.pathname)) return;

  const isPage = req.mode === 'navigate'
    || url.pathname.endsWith('/')
    || url.pathname.endsWith('index.html');

  if(isPage){
    /* 网络优先：拿到新版就更新缓存；断网时回退缓存 */
    e.respondWith(
      fetch(req).then(function(r){
        const cp = r.clone();
        caches.open(CACHE).then(function(c){ c.put(req, cp); }).catch(function(){});
        return r;
      }).catch(function(){
        return caches.match(req).then(function(r){
          return r || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* 静态资源：缓存优先，没命中再联网并回填 */
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(r){
        const cp = r.clone();
        caches.open(CACHE).then(function(c){ c.put(req, cp); }).catch(function(){});
        return r;
      });
    })
  );
});
