/**
 * Service Worker for Royal Barber Atelier (آرایشگاه رویال)
 * Provides native Web Push Notifications, Appointment Reminders,
 * Concierge Updates, Offline Caching, and Background Notification Routing.
 */

const CACHE_NAME = 'royal-atelier-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/favicon.ico',
];

// 1. Install Event: Precaching essential shell resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
});

// 2. Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let external APIs pass through
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// 4. Web Push Notification Event: Native Push Handling
self.addEventListener('push', (event) => {
  let data = {
    title: 'آرایشگاه رویال — اعلان جدید',
    body: 'نوبت یا وضعیت سفارش شما به‌روزرسانی شد.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'royal-notification',
    data: {
      url: '/',
      type: 'general',
    },
    actions: [
      { action: 'view', title: 'مشاهده جزئیات' },
      { action: 'close', title: 'بستن' },
    ],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: [100, 50, 100, 50, 200],
    data: data.data || { url: '/' },
    tag: data.tag || 'royal-notification',
    renotify: true,
    requireInteraction: false,
    dir: 'rtl',
    lang: 'fa',
    actions: data.actions || [
      { action: 'view', title: 'مشاهده جزئیات' },
      { action: 'close', title: 'بستن' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event: Deep Linking & Focus Management
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const notificationType = (event.notification.data && event.notification.data.type) || 'general';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and broadcast event
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            payload: {
              action,
              targetUrl,
              notificationType,
              data: event.notification.data,
            },
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Notification Close Event (Analytics/Clean-up)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed:', event.notification.tag);
});

// 7. Client Message Event: Direct client-to-worker commands
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  // Direct trigger from client application
  if (type === 'SHOW_NATIVE_NOTIFICATION') {
    const { title, body, icon, tag, data, actions } = payload || {};
    self.registration.showNotification(title || 'آرایشگاه رویال', {
      body: body || 'یادآور نوبت اختصاصی شما فعال است.',
      icon: icon || '/icon.svg',
      badge: '/icon.svg',
      vibrate: [120, 80, 120],
      tag: tag || 'royal-direct-alert',
      renotify: true,
      data: data || { url: '/' },
      dir: 'rtl',
      lang: 'fa',
      actions: actions || [
        { action: 'view', title: 'مشاهده نوبت' },
        { action: 'close', title: 'متوجه شدم' },
      ],
    });
  }

  // Schedule a reminder after delay in milliseconds
  if (type === 'SCHEDULE_REMINDER') {
    const { delayMs, title, body, tag, data } = payload || {};
    setTimeout(() => {
      self.registration.showNotification(title || 'یادآور نوبت آرایشگاه رویال', {
        body: body || '۱ ساعت تا نوبت شما در صندلی مستر باقی مانده است.',
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: tag || 'royal-appointment-reminder',
        renotify: true,
        data: data || { url: '/', type: 'appointment-reminder' },
        dir: 'rtl',
        lang: 'fa',
        actions: [
          { action: 'view', title: 'مشاهده جزئیات نوبت' },
          { action: 'close', title: 'بستن' },
        ],
      });
    }, delayMs || 5000);
  }
});
