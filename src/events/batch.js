import {fork} from "child_process";

import path, {dirname} from "path";
import {fileURLToPath} from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export function clean() {
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