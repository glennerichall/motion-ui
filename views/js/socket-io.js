import {publish} from './pubsub';
import io from 'socket.io-client';
import {fetch} from "./fetch";
import {fetchNotifications} from "./notifications";


export const socket = io();
socket.on('connect', () => {
    console.log('Connected to websocket');
    publish('connect');
});
socket.on('disconnect', () => {
    publish('disconnect');
});
socket.on('reconnect', () => {
    publish('reconnect');
});


(async () => {
    const notifications = await fetchNotifications();

    function flatten(elem) {
        if (typeof (elem) !== 'object') {
            return elem;
        }
        return Object.keys(elem).reduce((res, key) => {
            return res.concat(flatten(elem[key]));
        }, []);
    }
    flatten(notifications)
        .forEach(event => {
            console.log('registering ' + event)
            socket.on(event, data => {
                publish(event, data);
            })
        });
})();

