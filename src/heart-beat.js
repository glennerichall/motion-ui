const {io} = require('./server');
const Tail = require('nodejs-tail');

const Provider = require('./provider');

const logfile = process.env.LOG_FILE;

(async () => {
    const file = logfile || await new Provider().getApi().getLogFile();
    console.log(`watching log file at ${file}`);
    const tail = new Tail(file);

    let exprStopped = /\[0:motion\].+main: Threads finished/;
    let exprRestarting = /\[0:motion\].+motion_restart: Restarting motion/;
    let exprRestarted = /\[0:motion\].+main: Motion thread \d+ restart/;
    tail.on('line', (line) => {
        if (line.match(exprStopped)) {
            console.log('Motion has stopped');
            io.emit('motion-stopped', {
                offline:true
            });
        } else if (line.match(exprRestarting)) {
            console.log('Motion is restarting');
            io.emit('motion-restarting');
        } else if (line.match(exprRestarted)) {
            console.log('Motion is online');
            io.emit('motion-online');
        }
    })

    tail.on('close', () => {
        console.log('watching stopped');
    })

    tail.watch();
})();
