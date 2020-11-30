const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socket = require('socket.io');
const {promisify} = require('util');

const port = process.env.port || 3000;

const connection = client => {
    console.log(`Websocket connection : ${client.id}`);
}

const init = async () => {
    await promisify(server.listen).bind(server)(port);
    console.log(`listening on port http://localhost:${port}/`);
    io.emit('version-update');
}

const io = socket(server);
io.on('connection', connection);

module.exports = {
    app,
    server,
    io,
    init,
    express
}