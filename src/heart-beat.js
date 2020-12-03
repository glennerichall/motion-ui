const {io} = require('./server');
const Tail = require('nodejs-tail');
const {notifications} = require('./constants');
const Provider = require('./provider');

const logfile = process.env.LOG_FILE;

(async () => {
    let file = null;
    while (!file) {
        try {
            file = logfile || await new Provider().getApi().getLogFile();
        } catch (err) {}
    }

    console.log(`watching log file at ${file}`);
    const tail = new Tail(file);

    let exprStopped = /\[0:motion\].+main: Threads finished/;
    let exprRestarting = /\[0:motion\].+motion_restart: Restarting motion/;
    let exprRestarted = /\[0:motion\].+motion_restart: Motion restarted/;
    tail.on('line', (line) => {
        if (line.match(exprStopped)) {
            console.log('Motion has stopped');
            io.emit(notifications.motion.stopped, {
                offline: true
            });
        } else if (line.match(exprRestarting)) {
            console.log('Motion is restarting');
            io.emit(notifications.motion.restarting);
        } else if (line.match(exprRestarted)) {
            console.log('Motion is online');
            io.emit(notifications.motion.online);
        }
    })

    tail.on('close', () => {
        console.log('watching stopped');
    })

    tail.watch();
})();
