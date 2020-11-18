const express = require('express');
let Provider = require('../provider');

async function getStreams(req) {
    return await new Provider(req).getStreams();
}

const withEvents = stream => {
    const {id} = stream;
    stream.events = {
        all: `/v1/events/${id}/count`,
        today: `/v1/events/${id}/count?date=today`,
        last: `/v1/events/${id}/last?date=latest`,
        status: `/v1/events/${id}/status`
    };
    stream.notifications = {
        eventStart: 'motion-event-start',
        eventEnd: 'motion-event-end',
    };
    return stream;
};

module.exports.router = express.Router()
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
    });