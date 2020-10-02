const express = require('express');
var router = express.Router();

const MotionApi = require('./motion-api');
const apiHost = process.env.API_HOST;
const streamHost = process.env.STREAM_HOST;
const api = new MotionApi(apiHost, {streamHost});

// async function getStreams() {
//     let host = process.env.STREAM_HOST;
//
//     return config.cameras.map(camera => {
//         return {
//             url: `${host}/${camera.camera_id}/stream`,
//             id: camera.camera_id,
//             name: camera.camera_name
//         };
//     });
// }

module.exports.getStreams = async function getStreams() {
    const cameras = await api.getCameras();
    return await Promise.all(cameras.map(camera => camera.toObject()));
};

module.exports.router = router

    .get('/streams', async (req, res) => {
        const streams = await getStreams();
        if (!!streams) {
            res.send(streams);
        } else {
            res.end();
        }
    })

    .get('/streams/:id', async (req, res) => {
        const streams = await getStreams(req);
        const stream = streams.find(s => s.id == req.params.id);
        if (!!stream) res.json(stream);
        else res.status(404).end();
    })

    .get('/motion/pictures/:camera', (req, res) => {

    })

    .get('/motion/pictures/:camera/:event', (req, res) => {

    })

    .get('/motion/movies/:camera', (req, res) => {

    });


