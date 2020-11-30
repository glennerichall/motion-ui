const express = require('express');
const {cpu, drive, mem} = require('node-os-utils');

const cors = require('cors')

module.exports = express.Router()
    .use(cors())
    .use('/events', require('./events'))
    .use('/streams', require('./streams'))

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

require('../heart-beat');