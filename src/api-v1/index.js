const express = require('express');
const osu = require('node-os-utils');
const cpu = osu.cpu;

const cors = require('cors')

module.exports = express.Router()
    .use(cors())
    .use('/events', require('./events'))
    .use('/streams', require('./streams'))

    .get('/process', async (req, res) => {
        const usage = await cpu.usage();
        res.json({cpu: usage});
    })