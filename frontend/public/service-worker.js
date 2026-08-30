self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'Task Manager',
    body: 'You have a reminder.'
  };

  event.waitUntil(
    self.registration
      .showNotification(data.title, {
        body: data.body
      })
      .catch((error) => {
        console.error('Failed to display notification:', error);
      })
  );
});