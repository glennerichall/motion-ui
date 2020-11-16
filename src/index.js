const express = require('express');
const app = express();
const {promisify} = require('util');
const port = process.env.port || 3000;

const cors = require('cors')
const scoketio = require('socket.io');

const version = require('../package').version;

app.use(cors())

// app.use((req, res, next) => {
//     console.log(req.url);
//     next();
// })

app.use('/', express.static('static'));

app.get('/version', (req, res) => {
    res.send({version});
});

const {router: v1} = require('./api-v1');

app.use('/v1', v1);

module.exports = async () => {
    await promisify(app.listen).bind(app)(port);
    console.log(`listening on port http://localhost:${port}/`);

    const socket = scoketio(app.server);

    socket.on('connection', client => {

    });
};
