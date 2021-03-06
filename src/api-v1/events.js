const express = require('express');
const {io} = require('../server');
const authorizeWhitelistIps = require('../utils/block-ip');
const Provider = require('../motion/provider');
const differenceInSeconds = require('date-fns/differenceInSeconds');
const batch = require('../events/batch');
const sharp = require('sharp');
const path = require('path');
const {push} = require('./push');

const targetDir = process.env.TARGET_DIR;

const cameraEventStatus = {};

const {notifications} = require('../constants');

const update = (events) => {
    const addRoutes = event => {
        event.delete = `/v1/events/${event.camera}/${event.event}`;
        event.data = `/v1/events/data/${event.camera}/${event.event}`;
    }

    if (!Array.isArray(events)) {
        addRoutes(events);
    } else {
        events.forEach(addRoutes);
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

        let dir = await camera.getTargetDir();
        const id = camera.getId();
        events?.forEach(event => {
            event.src = event.filename.replace(dir, `/v1/events/data/${id}/file`);
            delete event.filename;
            if (event.type == 1) {
                event.srcSmall = `${event.src}?size=small`;
            }
        });

        res.send(events);
    })

    .get('/data/placeholder.jpg', async (req, res) => {
        let width = 200;
        let height = 110;
        if (req.query.size === 'small') {

        } else {

        }
        const img = await sharp({
            create: {
                width,
                height,
                channels: 4,
                background: {r: 125, g: 125, b: 125, alpha: 0.5}
            }
        }).jpeg();
        res.setHeader('content-type', `image/jpeg`);
        img.pipe(res);
    })

    .get('/data/:camera/file/*', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        let dir = targetDir ?? await camera.getTargetDir();
        const file = req.path.replace(
            `/data/${camera.getId()}/file`, dir);
        let ext = path.extname(file).substr(1);

        if (req.query.size === 'small') {
            let stream = await sharp(file).resize({
                width: 200,
            });

            if (ext === 'jpg') {
                ext = 'jpeg';
            }
            res.setHeader('content-type', `image/${ext}`);
            stream[ext]().pipe(res);
        } else {
            res.sendFile(file, {
                dotfiles: 'deny'
            });
        }
    })

    .delete('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents(req.query);
        res.send(events);
        io.emit(notifications.events.eventsDeleted,
            {
                camera: req.params.camera,
                events
            });
    })

    .delete('/:camera/:event', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.deleteEvents({
            ...req.params,
            ...req.query
        });
        res.send(events);
        io.emit(notifications.events.eventsDeleted,
            {
                camera: req.params.camera,
                events
            });
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

        const previousStatus = cameraEventStatus[camera] || false;

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

        if (previousStatus !== cameraEventStatus[camera]) {
            const event = notifications.events.eventTriggered;
            io.emit(event, {camera, status});
            push(event, {camera, status});
        } else {
            console.debug(`Camera ${camera} is already ${type}, not emitting anything`);
        }
        res.send('done');
    });

module.exports.routes = {
    events: '/',
    status: '/:camera/status',
}