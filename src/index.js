const express = require('express');
const app = express();
const server = require('http').createServer(app);

const {promisify} = require('util');
const port = process.env.port || 3000;

const cors = require('cors')

const version = require('../package').version;
const pubsub = require('./pubsub');

app.use(cors())

app.use((req, res, next) => {
    console.log(req.url);
    next();
})

app.use('/', express.static('static'));

app.get('/version', (req, res) => {
    res.send({version});
});

const {router: v1} = require('./api-v1');

app.use('/v1', v1);

module.exports = async () => {
    await promisify(server.listen).bind(server)(port);
    pubsub.init(server);
    console.log(`listening on port http://localhost:${port}/`);
};
