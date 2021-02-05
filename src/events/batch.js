const {fork} = require("child_process");
const path = require('path');

module.exports.clean = function clean() {
    return new Promise(async (resolve, reject) => {
        // https://github.com/nodejs/node/issues/9435
        const options = {
            execArgv: []
        };
        const proc = fork(path.join(__dirname, 'clean.js'), options);
        // const proc = fork(path.join(__dirname, 'clean.js'));
        proc.once('message', count => {
            resolve(count);
        });
    });
}