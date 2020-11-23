const express = require('express');
const events = require('../events/events');
const {io} = require('../server');
const authorizeWhitelistIps = require('../block-ip');
const Provider = require('../provider');

const cameras = {};

module.exports = express.Router()

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



    .get('/count', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const count = await camera.getEventCount(req.query);
        res.send(count);
    })

    .get('/count/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const count = await camera.getEventCount(req.query);
        res.send(count);
    })

    .get('/', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.getEvents(req.params);
        res.send(events);
    })

    .get('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.getEvents(req.params);
        res.send(events);
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


module.exports.routes = {
    events: '/',
    status : '/:camera/status',
}