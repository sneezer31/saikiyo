```javascript
const CACHE_NAME = 'sencho-app-v1';

// 1. インストール時にすぐ出番を交代
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. 古いキャッシュを自動でお掃除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 常にネットを優先！ダメな時だけキャッシュ
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 通信成功！最新データをコピーして保存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // 圏外なら保存したキャッシュを出す
        return caches.match(event.request);
      })
  );
});
```
