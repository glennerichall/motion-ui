import {io} from "../server.js";

import {Tail} from "tail";

import {notifications} from "../constants.js";

import Provider from "./provider.js";

const logfile = process.env.LOG_FILE;

(async () => {
    let file = null;
    while (!file) {
        try {
            file = logfile || await new Provider().getApi().getLogFile();
        } catch (err) {}
    }

    console.log(`watching log file at ${file}`);
    const tail = new Tail(file, {
        follow: true
    });

    let exprStopped = /\[0:motion\].+main: Threads finished/;
    let exprRestarting = /\[0:motion\].+motion_restart: Restarting motion/;
    let exprRestarted = /\[0:motion\].+(motion_restart: Motion restarted|motion_startup: Motion running as daemon process)/;
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

    tail.on('error', err => {
        console.log(err.message);
    });

    tail.watch();
})();
