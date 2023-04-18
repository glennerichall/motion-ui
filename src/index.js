import {
    app,
    init
} from "./server.js";

import express from "express";

import cors from "cors";
const {version}  = JSON.parse(fs.readFileSync('./package.json').toString());
import Provider from "./motion/provider.js";
import compression from "compression";
import api_v1 from "./api-v1/index.js";
import fs from "fs";

app.use(compression());
app.use(cors());

let previsoulog = null;
let count = 0;

app.use((req, res, next) => {
    if (req.url == previsoulog) {
        count++;
    } else {
        if (count > 1) {
            console.log('previous message ' + count + ' times');
        }
        previsoulog = req.url;
        console.log(req.method.toUpperCase() + ': ' + req.url);
        count = 1;
    }
    next();
})

if (process.env.NODE_ENV === 'development') {
    app.use('/', express.static('dist'));
} else {
    app.use('/', express.static('static'));
}

app.get('/version', (req, res) => {
    res.send({version});
});

app.use('/v1', api_v1);

export default async () => {
    await init();
    for (let camera of await new Provider().getCameras()) {
        await camera.init();
    }
}
