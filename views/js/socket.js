import {io} from 'socket.io-client';

const protocol = location.protocol === 'https:' ? 'wss' : 'ws';

console.log(`${protocol}://${location.host}/`);

export const socket = io(`${protocol}://${location.host}/`, {
    reconnectionDelayMax: 10000,
    secure: protocol === 'wss'
});