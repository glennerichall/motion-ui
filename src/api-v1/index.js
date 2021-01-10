const express = require('express');
const {cpu, drive, mem} = require('node-os-utils');

const appPrivKey = 'j8H_LHJo9nHVir6EWpXKj19g9BG5sFYsrgt2GhrKg_8';

const cors = require('cors')

module.exports = express.Router()
    .use(cors())
    .use('/3000events', require('./events'))
    .use('/streams', require('./streams'))
    .use('/push', require('./push'))

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
        res.send(require('../constants').notifications);
    })



require('../motion/heart-beat');