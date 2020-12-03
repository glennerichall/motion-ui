import {publish} from "./pubsub";
import {fetchNotifications} from "./notifications";
import {eventStatusUrl, streamStatusUrl} from "../constants";
import {fetch} from "./fetch";

export const socket = {
    on() { },
    off() { },
    connected: true
};


(async () => {
    const notifications = await fetchNotifications();
    setInterval(async () => {
        const [statuses, events] = await Promise.all(
            [fetch(streamStatusUrl),
                fetch(eventStatusUrl)]);
        statuses.forEach(status => {
            publish(notifications.streams.connectionStatusChanged, status);
        });
        events.forEach(status => {
            publish(notifications.events.eventTriggered, status);
        })
    }, 30 * 1000 /* 30 seconds */);

})();