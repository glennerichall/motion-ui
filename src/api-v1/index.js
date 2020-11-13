const express = require('express');
const osu = require('node-os-utils');
const cpu = osu.cpu;

const {router: events} = require('./events');
const {router: streams} = require('./streams');

const cors = require('cors')

module.exports.router = express.Router()
    .use(cors())
    .use('/events', events)
    .use('/streams', streams)

    .get('/process', async (req, res) => {
        const usage = await cpu.usage();
        res.json({cpu: usage});
    })