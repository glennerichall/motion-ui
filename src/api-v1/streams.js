const express = require('express');
let Provider = require('../provider');

async function getStreams(req) {
    return await new Provider(req).getStreams();
}

const withEvents = stream => {
    const {id} = stream;
    stream.events = {
        count:{
            all: `/v1/events/count/${id}`,
            today: `/v1/events/count/${id}?date=today`,
            last: `/v1/events/${id}?orderBy=begin desc&limit=1`,
        },
        files:{
            all: `/v1/events/${id}`,
            today: `/v1/events/${id}?date=today`
        },
        status: `/v1/events/${id}/status`
    };
    stream.notifications = {
        eventStart: 'motion-event-start',
        eventEnd: 'motion-event-end',
    };
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
    });