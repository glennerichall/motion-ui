const express = require('express');
const events = require('../events');
const pubsub = require('../pubsub');

module.exports.router = express.Router()

    .get(['/:camera/:what', '/:what'], async (req, res) => {
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
            if (info) res.send(info);
            else res.status(500).send('internal error');
        } else {
            res.status(404).send('not found');
        }
    })

    .post('/:camera', async (req, res) => {
        var requestIP = req.connection.remoteAddress;
        console.log(requestIP)
        const {camera} = req.params;
        const {type} = req.query;
        pubsub.emit('new-event', {camera, type});
        res.send('done');
    });
