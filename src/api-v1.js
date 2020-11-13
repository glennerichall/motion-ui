const express = require('express');
let router = express.Router();
let Provider = require('./provider');
const events = require('./events');
const cors = require('cors')


async function getStreams(req) {
    return await new Provider(req).getStreams();
}

module.exports.getEvents = async function getEvents() {
    // events.getEvents()
};


module.exports.router = router

    .use(cors())

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

    .get('/pictures/:camera', (req, res) => {

    })

    .get('/movies/:camera', (req, res) => {

    })

    .get(['/events/:camera/:what', '/events/:what'], async (req, res) => {
        const {camera, what} = req.params;

        const builder = events.getBuilder();
        if (camera) builder.for(camera);

        let {date} = req.query;
        if (date) date = date.toLowerCase();

        if (date === 'today') builder.today();
        else if (date === 'everyday') builder.everyDay();
        else if (date === 'latest') builder.latest();

        if (builder[what]) {
            builder[what]();

            const info = await builder.fetch();
            res.send(info);
        } else {
            res.status(404).send('not found');
        }
    })



