import io from 'socket.io-client';

const protocol = location.protocol === 'https:' ? 'wss' : 'ws';

export const socket = io();

socket.on('connect', () => {
    console.log('Connected to websocket');
})