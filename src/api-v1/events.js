import express from "express";
import {io} from "../server.js";

import authorizeWhitelistIps from "../utils/block-ip.js";
import Provider from "../motion/provider.js";
import {differenceInSeconds} from "date-fns";
import {clean} from "../events/batch.js";
import sharp from "sharp";
import path from "path";
import {push} from "./push.js";


import {notifications} from "../constants.js";

const targetDir = process.env.TARGET_DIR;

const cameraEventStatus = {};


const updateEvents = (events) => {
    const addRoutes = event => {
        event.delete = `/v1/events/${event.camera}/${event.event}`;
        event.data = `/v1/events/data/${event.camera}/${event.event}`;
        event.lock = `/v1/events/${event.camera}/lock?event=${event.event}`;
    }

    if (!Array.isArray(events)) {
        addRoutes(events);
    } else {
        events.forEach(addRoutes);
    }
    return events;
}

const updateCalendar = calendar => {
    const addRoutes = day => {
        day.events = `/v1/events/${day.camera}?date=${day.date}`;
    }

    if (!Array.isArray(calendar)) {
        addRoutes(calendar);
    } else {
        calendar.forEach(addRoutes);
    }
    return calendar;
}

let exec = {
    clean: false
};

export default express.Router()
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

    .post('/:camera/lock', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.lock(req.query);
        res.status(201).send();
        io.emit(notifications.events.eventsLocked,
            {
                camera: req.params.camera,
                events
            });
    })

    .delete('/:camera/lock', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.unlock(req.query);
        res.status(201).send();
        io.emit(notifications.events.eventsLocked,
            {
                camera: req.params.camera,
                events
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
        res.send(updateEvents(events));
    })

    .get('/calendar', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const calendar = await camera.getCalendar(req.query);
        res.send(updateCalendar(calendar));
    })

    .get('/calendar/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const calendar = await camera.getCalendar(req.query);
        res.send(updateCalendar(calendar));
    })

    .get('/:camera', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        const events = await camera.getEvents(req.query);
        res.send(updateEvents(events));
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

    .post('/:camera/record', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        camera.record();
        res.send('done');
    })

    .delete('/:camera/record', async (req, res) => {
        const camera = await new Provider(req).getCamera();
        camera.stopRecord();
        res.send('done');
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
            const count = await clean();
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
        let status;

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
            // push(event, {camera, status});
        } else {
            console.debug(`Camera ${camera} is already ${type}, not emitting anything`);
        }
        res.send('done');
    });

export const routes = {
    events: '/',
    status: '/:camera/status',
};