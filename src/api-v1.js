const express = require('express');
let router = express.Router();
let Provider = require('./provider');
const events = require('./events');

module.exports.getStreams = async function getStreams(req) {
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

    .get('/motion/movies/:camera', (req, res) => {

    })

    .get('/motion/events/:camera/count', async (req, res) => {
        const {camera} = req.params;
        let count = await events.getEventCount(camera);
        res.send(count);
    })

    .get('/motion/events/count', async (req, res) => {
        let count = await events.getEventCount();
        res.send(count);
    });


