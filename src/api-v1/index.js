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

    .get('/notifications', (req, res) => {
        res.send(notifications);
    });