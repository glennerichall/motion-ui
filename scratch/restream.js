// Pipe the RTSP stream to the video loopback device
import {spawn} from 'child_process';
import {WebSocketServer} from 'ws';
import http from 'http';
import express from "express";

const app = express();

import Splitter from 'stream-split';

app.use(express.static('./public'));
const server = http.createServer(app);
server.listen(3000);
const wss = new WebSocketServer({server});

const args = [
    '-i', 'rtsp://192.168.1.102:554/12',
    '-an',  // disable audio
    '-c:v',  'libx264',
    '-vprofile', 'baseline',
    '-tune', 'zerolatency',
    '-pix_fmt', 'yuv420p',
    '-f' ,'rawvideo',
    '-'];
const ffmpeg = spawn('ffmpeg', args);

ffmpeg.stderr.on('data', (data) => {
    console.log(data.toString());
});
ffmpeg.on('exit', () => {
    console.log('FFmpeg process exited');
});

const NALseparator = new Buffer([0, 0, 0, 1]);

// send video stream to WebSocket clients
wss.on('connection', function connection(ws) {
    let readStream = ffmpeg.stdout;
    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on('data', function (data) {
        const comp = Buffer.concat([NALseparator, data]);
        ws.send(comp, {binary: true});
    });
});

// import { spawn } from 'child_process';
// import net from 'net';
// import Splitter from 'stream-split';
//
// const HOST = '127.0.0.1'; // Change this to the IP address of your server
// const PORT = 8000; // Change this to the port number you want to use
//
// const NALseparator    = Buffer.from([0,0,0,1]);//NAL break
// const server = net.createServer(function (socket) {
//     console.log('Client connected');
//
//     const ffmpeg = spawn('ffmpeg', [
//         '-f', 'v4l2', // capture from v4l2 device
//         '-i', '/dev/video0',
//         '-an', // disable audio
//         '-c:v', 'libx264',
//         '-b:v', '600k',
//         '-bufsize', '600k',
//         '-vprofile', 'baseline',
//         '-tune', 'zerolatency',
//         '-f', 'mpegts',
//         '-'
//     ]);
//
//     ffmpeg.stderr.on('data', (data) => {
//         console.log(data.toString());
//     });
//
//     ffmpeg.on('exit', () => {
//         console.log('FFmpeg process exited');
//     });
//
//     let readStream = ffmpeg.stdout;
//     // readStream = readStream.pipe(new Splitter(NALseparator));
//     readStream.on('data', function (data) {
//         // console.log(data[0], data[1], data[2], data[3], data[4], data[5])
//         // console.log(data.length)
//         // const nalBuffer = Buffer.concat([NALseparator, data]);
//         // const nalUint8Array = new Uint8Array(nalBuffer);
//         socket.write(new Uint8Array(data));
//     });
//
//     socket.on('end', function () {
//         console.log('Client disconnected');
//     });
// });
//
// server.listen(PORT, HOST, function () {
//     console.log(`Server listening on ${HOST}:${PORT}`);
// });
