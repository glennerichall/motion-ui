import express from "express";

import "../motion/heart-beat.js";
import push from "./push.js";
import streams from "./streams.js";
import events from "./events.js";
import cors from "cors";
import OsUtils from "node-os-utils";

const {
    cpu,
    drive,
    mem
} = OsUtils;

import {notifications} from "../constants.js";

import pm2 from "pm2";
import {io} from "../server.js";
import Provider from "../motion/provider.js";

async function sendCameraLost(req) {
    const cameras = await new Provider(req).getCameras();
    const status = cameras.map(async camera => {
        return {
            camera: camera.getId(),
            status: 'lost-connection'
        };
    });

    console.log(status)

    for (let stat of status) {
        io.emit(notifications.streams.connectionStatusChanged, stat);
    }

}

export default express.Router()
    .use(cors())
    .use('/events', events)
    .use('/streams', streams)
    .use('/push', push)

    .get('/process', async (req, res) => {
        const cpuUsage = cpu.usage();
        const driveUsage = drive.info();
        const memUsage = mem.info();
        res.json({
            cpu: await cpuUsage,
            drive: Number.parseFloat((await driveUsage).usedPercentage),
            mem: 100 - (await memUsage).freeMemPercentage
        });
    })

    .post('/motion/restart', async (req, res) => {
        pm2.connect((err) => {
            if (err) {
                console.error(err.message);
                res.status(500).end();
                return;
            }

            pm2.restart('motion', (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).end();
                    return;
                }
                pm2.disconnect();
                sendCameraLost(req);
                res.status(201).end();
            });
        });
    })

    .post('/motion/reload', async (req, res) => {

        pm2.connect((err) => {
            if (err) {
                console.log(err.message);
                res.status(500).end();
                return;
            }

            pm2.sendSignalToProcessName('SIGHUP', 'motion', (err) => {
                if (err) {
                    console.log(err.message);
                    res.status(500).end();
                    return;
                }
                pm2.disconnect();
                sendCameraLost(req);
                res.status(201).end();
            });
        });

    })

    .get('/notifications', (req, res) => {
        res.send(notifications);
    });