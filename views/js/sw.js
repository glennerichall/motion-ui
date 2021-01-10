import icon from '../icons/icon-32.png';

self.addEventListener('push', function (event) {
    const motion = event.data.json();
    const title = 'Motion Event';
    const body = `An event has been triggered for camera ${motion.camera}`;
    const options = {
        body,
        icon,
        badge: 'images/badge.png',
        vibrate: true,
        tag: 'motionEventTriggered'
    };
    if (motion.event === 'motion-event-triggered' && motion.status === 'recording') {
        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(self.clients.matchAll().then(clients => {
        if(clients.length){ // check if at least one tab is already open
            clients[0].focus();
        } else {
            self.clients.openWindow('/');
        }
    }));
});