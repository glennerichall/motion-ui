const express = require('express');
const events = require('../events');
const {io} = require('../server');
const authorizeWhitelistIps = require('../block-ip');

const cameras = {};

module.exports.router = express.Router()

    .get('/:camera/status', (req, res) => {
        const {camera} = req.params;
        const recording = cameras[camera];
        const status = recording ? 'recording' : 'idle';

        // TODO camera exists
        res.send({
            camera,
            status
        });
    })

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


    .post('/:camera', authorizeWhitelistIps, async (req, res) => {
        const {camera} = req.params;
        const {type} = req.query;

        // FIXME use database ???
        if (type === 'start') {
            cameras[camera] = true;
        } else {
            cameras[camera] = false;
        }
        io.emit(`motion-event-${type}`, {camera, type});
        res.send('done');
    })
