const express = require('express');
let router = express.Router();
let Provider = require('./provider');
const events = require('./events');

module.exports.getStreams = async function getStreams(req) {
    // let cameras = await new Provider(req).getCameras();
    // let events = await cameras[0].getEvents();
    return await new Provider(req).getStreams();
};

module.exports.getEvents = async function getEvents() {
    // events.getEvents()
};

module.exports.router = router

    .get('/streams', async (req, res) => {
        const streams = await getStreams(req);
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


