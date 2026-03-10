// CRED Kit Service Worker
const CACHE_NAME = 'cred-kit-v1.0.0';
const STATIC_CACHE = 'cred-kit-static-v1';
const DATA_CACHE = 'cred-kit-data-v1';

// Файлы для кэширования при установке
const STATIC_ASSETS = [
  '/',
  '/ru',
  '/en',
  '/manifest.json',
  '/icons/icon.svg'
];

// Данные для кэширования (API endpoints, если будут)
const DATA_URLS = [
  '/data/implants/',
  '/data/netrunning/',
  '/data/skills.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DATA_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем не-GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Внешние ресурсы не кэшируем через SW, чтобы не ломать CORS и загрузку шрифтов.
  if (url.origin !== location.origin) {
    return;
  }

  // Для локальных ресурсов используем стратегию Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Возвращаем из кэша и обновляем в фоне
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(STATIC_CACHE)
                    .then((cache) => cache.put(request, networkResponse));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        // Если нет в кэше, запрашиваем из сети
        return fetch(request)
          .then((networkResponse) => {
            // Кэшируем успешные ответы
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            // Если офлайн и нет в кэше, возвращаем offline page
            if (request.destination === 'document') {
              return caches.match('/ru');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(STATIC_CACHE);
    caches.delete(DATA_CACHE);
    console.log('[SW] Cache cleared');
  }
});

// Background sync (для будущего функционала)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-character') {
    console.log('[SW] Background sync: character data');
  }
});

// Push notifications (для будущего функционала)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification:', data);

    event.waitUntil(
      self.registration.showNotification(data.title || 'CRED Kit', {
        body: data.body || 'У вас новое уведомление',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag: data.tag || 'default',
        data: data.url || '/'
      })
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Если есть открытое окно, фокусируем его
        for (const client of clientList) {
          if (client.url === event.notification.data && 'focus' in client) {
            return client.focus();
          }
        }
        // Иначе открываем новое
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data);
        }
      })
  );
});

console.log('[SW] Service Worker loaded');
