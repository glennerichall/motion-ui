const {app, init, express} = require('./server');
const cors = require('cors')
const version = require('../package').version;
const Provider = require('./motion/provider');
var compression = require('compression')

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
    app.use('/', express.static('bin'));
} else {
    app.use('/', express.static('static'));
}

app.get('/version', (req, res) => {
    res.send({version});
});

app.use('/v1', require('./api-v1'));

module.exports = async () => {
    await init();
    for (let camera of await new Provider().getCameras()) {
        await camera.init();
    }
};
