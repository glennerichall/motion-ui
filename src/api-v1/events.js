const express = require('express');
const events = require('../events/events');
const {io} = require('../server');
const authorizeWhitelistIps = require('../block-ip');
const Provider = require('../provider');
const formatDuration = require('date-fns/formatDuration');
const intervalToDuration = require('date-fns/intervalToDuration');
const differenceInSeconds = require('date-fns/differenceInSeconds');
const batch = require('../events/batch');

const cameraEventStatus = {};

const {notifications} = require('../constants');

const appendRoutes = (event) => {
    return event;
}

const update = (events) => {
    const calcDuation = event => {
        const {begin, end} = event;
        const duration = intervalToDuration({
            start: new Date(begin),
            end: new Date(end)
        });
        event.duration = formatDuration(duration);
        event.delete = `/v1/events/${event.camera}/${event.event}`;
    }

    if (!Array.isArray(events)) {
        calcDuation(events);
    } else {
        events.forEach(calcDuation);
    }
    return events;
}

let exec = {
    clean: false
};

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
        res.send(update(events));
    })

    .delete('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents(req.query);
        res.send(events);
    })

    .delete('/:camera/:event', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents({
            ...req.params,
            ...req.query
        });
        res.send(events);
    })

    .post('/exec/clean-events', async (req, res) => {
        if (exec.clean) {
            res.send({
                message: 'already started'
            });
        } else {
            exec.clean = true;
            res.send({message: 'started'});
            io.emit(notifications.events.cleanTriggered, {type: 'start'});
            const start = new Date();
            const count = await batch.clean();
            const end = new Date();
            const duration = differenceInSeconds(end, start);
            console.log(`cleaned database and files in ${duration} seconds`);
            console.log(count);
            exec.clean = false;
            io.emit(notifications.events.cleanTriggered,
                {
                    type: 'done',
                    count,
                    duration
                });
        }
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