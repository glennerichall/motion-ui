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
import {resolve} from "path";

async function sendCameraLost(req) {
    const cameras = await new Provider(req).getCameras();
    let status = cameras.map(async camera => {
        return {
            camera: camera.getId(),
            status: 'lost-connection'
        };
    });

    status = await Promise.all(status);

    for (let stat of status) {
        io.emit(notifications.streams.connectionStatusChanged, stat);
    }

    while (true) {
        status = cameras.map(async camera => {
            return {
                camera: camera.getId(),
                status: await camera.getStatus()
            };
        });

        status = await Promise.all(status);

        let count = 0;
        for (let camera of cameras) {
            const stat = await camera.getStatus();
            if (stat === 'idle') {
                count++;
                io.emit(notifications.streams.connectionStatusChanged, {
                    camera: camera.getId(),
                    status: 'idle'
                });
            }
        }

        if (count === cameras.length) {
            break;
        }

        await new Promise(resolve => {
            setTimeout(resolve, 500);
        });
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
            // must send before killing because motion will be dead
            sendCameraLost(req);

            pm2.restart('motion', (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).end();
                    return;
                }
                console.log('motion restarted');
                res.status(201).end();
                pm2.disconnect();
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

            // must send before killing because motion will be dead
            sendCameraLost(req);

            pm2.sendSignalToProcessName('SIGHUP', 'motion', (err) => {
                if (err) {
                    console.log(err.message);
                    res.status(500).end();
                    return;
                }
                console.log('motion reloaded');
                res.status(201).end();
                pm2.disconnect();
            });
        });

    })

    .get('/notifications', (req, res) => {
        res.send(notifications);
    });