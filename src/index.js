const {app, init, express} = require('./server');
const cors = require('cors')
const version = require('../package').version;
const {io} = require('./server');

app.use(cors())

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
        console.log(req.url);
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

module.exports = init;
