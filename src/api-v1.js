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

    .get('/motion/events/:camera/count', (req, res, next) => {
        const {camera} = req.params;
        const builder = events.getEventCount().for(camera);
        req.builder = builder;
        next();
    })

    .get('/motion/events/count', (req, res, next) => {
        const builder = events.getEventCount();
        req.builder = builder;
        next();
    })

    .use(async (req, res, next) => {
        const {builder} = req;
        if (builder) {
            let {date} = req.query;
            if (date) date = date.toLowerCase();

            if (date === 'today') builder.today();
            else if (date === 'everyday') builder.everyDay();

            const count = await builder.fetch();
            res.send(count);
        } else {
            next();
        }
    })


