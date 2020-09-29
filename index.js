const express = require('express');
const app = express();
const {promisify} = require('util');
const port = process.env.port || 3000;
const read_configs = require('./read_configs');

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

let config;

function getStreams(req) {
    let proto = req.get('X-Forwarded-Proto') || (req.connection.encrypted ? 'https' : 'http');
    let host = req.get('X-Forwarded-Host') || req.get('host');

    return config.cameras.map(camera => {
        return {
            url: `${proto}://${host}/${camera.camera_id}/stream`,
            id: camera.camera_id,
            name: camera.camera_name
        };
    });
}

app
    .get('/streams', (req, res) => {
        let streams = getStreams(req);
        if (!!config.cameras) {
            res.send(streams);
        } else {
            res.end();
        }
    })

    .get('/streams/:id', (req, res) => {
        let streams = getStreams(req);
        let stream = streams.find(s => s.id == req.params.id);
        if (!!stream) res.json(stream);
        else res.status(404).end();
    })

    .get('/', (req, res) => {
        res.render('index',
            {
                streams: getStreams(req)
            }
        );
    });


(async () => {
        config = await read_configs();
        console.log(`found ${config.cameras.length} camera(s) in ${config.glob.motion_conf}`);

        await promisify(app.listen).bind(app)(port);
        console.log(`listening on port http://localhost:${port}`);
    }
)();


