const express = require('express');
const app = express();
const {promisify} = require('util');
const port = process.env.port || 3000;
const read_configs = require('./read-configs');

app.set('views', __dirname + '/../views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());
app.use('/css', express.static('css'));

const {router, getStreams} = require('./api-v1');

app.use(router);


app.get('/', async (req, res) => {
    res.render('index',
        {
            streams: await getStreams(req)
        }
    );
});


module.exports = async () => {
    // const config = await read_configs();
    // if (!!config) {
    //     console.log(`found ${config.cameras.length} camera(s) in ${config.glob.motion_conf}`);
    // }

    await promisify(app.listen).bind(app)(port);
    console.log(`listening on port http://localhost:${port}`);
};
