// ChatPals service worker — makes notifications work when added to home screen,
// enables PWA install on iOS/Android, and triggers auto-updates when the app changes.

// 🔄 Bump this any time we deploy. Browsers will detect the new SW, install it,
// activate it, and the page will reload automatically to show the latest version.
const SW_VERSION = '17';

const CACHE_NAME = 'chatpals-v1';

self.addEventListener('install', (event) => {
  // Activate the new service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of any open pages right away
  event.waitUntil(self.clients.claim());
});

// When the user taps a notification, focus or open ChatPals
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetChatId = event.notification.data && event.notification.data.chatId;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      // Try to focus an existing window
      for (const client of clientsList) {
        if ('focus' in client) {
          // Tell the page to open the right chat
          if (targetChatId) {
            try { client.postMessage({ type: 'open-chat', chatId: targetChatId }); } catch {}
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

// Allow the page to ask the SW to show a notification
// (this is the path that works on iOS PWAs)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'show-notification') {
    self.registration.showNotification(
      event.data.title,
      event.data.options || {}
    );
  }
});
