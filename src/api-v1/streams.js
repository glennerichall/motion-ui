const express = require('express');
let Provider = require('../provider');

async function getStreams(req) {
    return await new Provider(req).getStreams();
}

module.exports.router = express.Router()
    .get('/', async (req, res) => {
        const streams = await getStreams(req);
        if (!!streams) {
            res.send(streams);
        } else {
            res.end();
        }
    })

    .get('/:id', async (req, res) => {
        const streams = await getStreams(req);
        const stream = streams.find(s => s.id == req.params.id);
        if (!!stream) res.json(stream);
        else res.status(404).end();
    });