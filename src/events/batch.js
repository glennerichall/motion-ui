const {fork} = require("child_process");
const path = require('path');

module.exports.clean = function clean() {
    return new Promise(async (resolve, reject) => {
        const proc = fork(path.join(__dirname, 'clean.js'));
        proc.once('message', count => {
            resolve(count);
        });
    });
}