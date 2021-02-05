module.exports.notifications = {
    events: {
        eventTriggered: 'motion-event-triggered',
        cleanTriggered: 'motion-events-clean',
        eventsDeleted: 'motion-events-deleted'
    },
    streams: {
        connectionStatusChanged: 'motion-camera-connection'
    },
    motion: {
        restarting: 'motion-restarting',
        online: 'motion-online',
        stopped: 'motion-stopped'
    }
};