// Service worker for the ZED MEGA admin app (scope: /admin).
// Shows push notifications for new quotes and keeps an offline fallback page.

const CACHE = 'zedmega-admin-v1'
const OFFLINE_URL = '/admin'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/admin-icons/icon-192.png'])).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('zedmega-admin-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// Admin pages always load fresh from the network; the cached shell only covers being offline.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = { body: event.data && event.data.text() } }
  const title = data.title || 'ZED MEGA Admin'
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || 'You have a new update.',
    icon: '/admin-icons/icon-192.png',
    badge: '/admin-icons/badge-96.png',
    tag: data.tag || 'zedmega-admin',
    renotify: true,
    vibrate: [120, 60, 120],
    data: { url: data.url || '/admin' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/admin', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin + '/admin'))
      if (open) return open.navigate(target).then((client) => (client || open).focus())
      return self.clients.openWindow(target)
    }),
  )
})
