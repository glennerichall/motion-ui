const express = require('express');
let Provider = require('../provider');
const {io} = require('../server');
const authorizeWhitelistIps = require('../block-ip');

async function getStreams(req) {
    return await new Provider(req).getStreams();
}

const withEvents = stream => {
    const {id} = stream;
    stream.events = {
        count: {
            all: `/v1/events/count/${id}`,
            today: `/v1/events/count/${id}?date=today`,
            last: `/v1/events/${id}?orderBy=begin desc&limit=1`,
        },
        data: {
            all: `/v1/events/${id}/data`,
            today: `/v1/events/${id}/data?date=today`
        },
        all: `/v1/events/${id}`,
        today: `/v1/events/${id}?date=today`,
        status: `/v1/events/${id}/status`
    };
    stream.notifications = {
        eventStart: 'motion-event-start',
        eventEnd: 'motion-event-end',
        statusChanged: 'motion-status-changed'
    };
    stream.details = `/v1/streams/${id}/details`;
    return stream;
};


module.exports = express.Router()
    .get('/', async (req, res) => {
        const streams = await getStreams(req);
        if (!!streams) {
            streams.forEach(withEvents);
            res.send(streams);
        } else {
            res.end();
        }
    })

    .get('/:id', async (req, res) => {
        const streams = await getStreams(req);
        const stream = streams.find(s => s.id == req.params.id);
        if (!!stream) {
            withEvents(stream);
            res.json(stream);
        } else res.status(404).end();
    })

    .get('/:camera/details', async (req, res) => {
        const details = await new Provider(req).getCamera().toDetails();
        res.send(details);
    })

    .post('/:camera/status', authorizeWhitelistIps, async (req, res) => {
        io.emit('motion-status-changed',
            {
                camera: req.params.camera,
                status: req.query.type
            });
        res.send('done');
    });