import express from "express";
import Provider from "../motion/provider.js";
import {io} from "../server.js";

import authorizeWhitelistIps from "../utils/block-ip.js";
import {notifications} from "../constants.js";

async function getStreams(req) {
    return await new Provider(req).getStreams();
}



const appendRoutes = stream => {
    const {id} = stream;
    stream.events = {
        count: {
            all: `/v1/events/count/${id}`,
            today: `/v1/events/count/${id}?date=today`
        },
        data: {
            all: `/v1/events/${id}/data`,
            today: `/v1/events/${id}/data?date=today`
        },
        last: `/v1/events/${id}?orderBy=begin%20desc&limit=1`,
        all: `/v1/events/${id}?orderBy=begin`,
        today: `/v1/events/${id}?date=today&orderBy=begin`,
        status: `/v1/events/${id}/status`,
        calendar: `/v1/events/calendar/${id}`,
        trigger: `/v1/events/${id}/record`
    };
    stream.status = `/v1/streams/${id}/status`;
    stream.details = `/v1/streams/${id}/details`;
    return stream;
};


export default express.Router()
    .get('/', async (req, res) => {
        const streams = await getStreams(req);
        if (!!streams) {
            streams.forEach(appendRoutes);
            res.send(streams);
        } else {
            res.end();
        }
    })

    .get('/notifications', (req, res) => {
        const {streams} = notifications;
        res.send(streams);
    })

    .get('/status', async (req, res) => {
        const cameras = await new Provider(req).getCameras();
        const status = cameras.map(async camera => {
            return {
                camera: camera.getId(),
                status: await camera.getStatus()
            };
        });
        res.send(await Promise.all(status));
    })

    .get('/:id', async (req, res) => {
        const streams = await getStreams(req);
        const stream = streams.find(s => s.id == req.params.id);
        if (!!stream) {
            appendRoutes(stream);
            res.json(stream);
        } else res.status(404).end();
    })

    .get('/:camera/details', async (req, res) => {
        const details = await new Provider(req).getCamera().toDetails();
        res.send(details);
    })

    .get('/:camera/status', async (req, res) => {
        const status = await new Provider(req).getCamera().getStatus();
        res.send({
            camera: req.params.camera,
            status
        });
    })

    .post('/:camera/status', authorizeWhitelistIps, async (req, res) => {
        io.emit(notifications.streams.connectionStatusChanged,
            {
                camera: req.params.camera,
                status: req.query.type
            });
        res.send('done');
    });