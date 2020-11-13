const express = require('express');
const events = require('../events');

module.exports.router = express.Router()

    .get(['/:camera/:what', '/events/:what'], async (req, res) => {
        const {camera, what} = req.params;

        const builder = events.getBuilder();
        if (camera) builder.for(camera);

        let {date} = req.query;
        if (date) date = date.toLowerCase();

        if (date === 'today') builder.today();
        else if (date === 'everyday') builder.everyDay();
        else if (date === 'latest') builder.latest();

        if (builder[what]) {
            builder[what]();

            const info = await builder.fetch();
            if (info) res.send(info);
            else res.status(500).send('internal error');
        } else {
            res.status(404).send('not found');
        }
    });
