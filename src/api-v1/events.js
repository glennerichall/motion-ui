const express = require('express');
const events = require('../events/events');
const {io} = require('../server');
const authorizeWhitelistIps = require('../block-ip');
const Provider = require('../provider');
const formatDuration = require('date-fns/formatDuration');
const intervalToDuration = require('date-fns/intervalToDuration');

const cameraEventStatus = {};

const {notifications} = require('../constants');

const update = (events) => {
    const calcDuation = event => {
        const {begin, end} = event;
        const duration = intervalToDuration({
            start: new Date(begin),
            end: new Date(end)
        });
        event.duration = formatDuration(duration);
    }

    if (!Array.isArray(events)) {
        calcDuation(events);
    } else {
        events.forEach(calcDuation);
    }
    return events;
}

module.exports = express.Router()
    .get('/notifications', (req, res) => {
        res.send(notifications.events);
    })

    .get('/status', async (req, res) => {
        const cameras = await new Provider(req).getCameras();

        const status = cameras.map(camera => {
            const recording = cameraEventStatus[camera.getId()];
            const status = recording ? 'recording' : 'idle';
            return {
                camera: camera.getId(),
                status
            };
        });

        res.send(status);
    })

    .get('/:camera/status', (req, res) => {
        const {camera} = req.params;
        const recording = cameraEventStatus[camera];
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
        const events = await camera.getEvents(req.query);
        res.send(update(events));
    })

    .get('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.getEvents(req.query);
        res.send(update(events));
    })

    .get('/data/:camera/:event', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.getData(req.params);
        res.send(events);
    })

    .delete('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents();
        res.send(events);
    })

    .delete('/:camera/:event', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents(req.params);
        res.send(events);
    })

    .post('/:camera/status', authorizeWhitelistIps, async (req, res) => {
        const {camera} = req.params;
        const {type} = req.query;

        // FIXME use database ???
        if (type.toLowerCase() === 'start') {
            cameraEventStatus[camera] = true;
            status = 'recording';
        } else if (type.toLowerCase() === 'end') {
            cameraEventStatus[camera] = false;
            status = 'idle';
        } else {
            res.status(400).send('invalid status');
            return;
        }

        const event = notifications.events.eventTriggered;
        io.emit(event, {camera, status});
        res.send('done');
    })


module.exports.routes = {
    events: '/',
    status: '/:camera/status',
}