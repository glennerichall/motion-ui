import {subscribe as subs, publish as pubs, unsubscribe as unsub} from 'pubsub-js';

export const subscribe = (event, callback) => {
    return subs(event, (_, data) => callback(data));
}

export const unsubscribe = unsub;

export const publish = (event, data) => {
    console.log(event);
    pubs(event, data);
};

