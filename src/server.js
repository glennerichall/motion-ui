import express from "express";
import {createServer} from "http";
import {promisify} from "util";

export const app = express();
export const server = createServer(app);
import {Server} from 'socket.io';


const port = process.env.PORT || 3000;

const connection = client => {
    console.log(`Websocket connection : ${client.id}`);
}

app.use(express.json());

export const init = async () => {
    await promisify(server.listen).bind(server)(port);
    console.log(`listening on port http://localhost:${port}/`);
}

export const io = new Server(server);
io.on('connection', connection);