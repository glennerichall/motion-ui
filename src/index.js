const {app, init, express} = require('./server');
const cors = require('cors')
const version = require('../package').version;

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

module.exports = init;
