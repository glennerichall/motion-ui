const {app, init, express} = require('./server');
const cors = require('cors')
const version = require('../package').version;

app.use(cors())

app.use((req, res, next) => {
    console.log(req.url);
    next();
})

if(process.env.NODE_ENV === 'development') {
    app.use('/', express.static('bin'));
}else {
    app.use('/', express.static('static'));
}

app.get('/version', (req, res) => {
    res.send({version});
});

app.use('/v1', require('./api-v1'));

module.exports = init;
