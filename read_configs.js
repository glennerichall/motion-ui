const homedir = require('os').homedir();
const fs = require('fs').promises;
const ps = require('ps-node');
const {promisify} = require('util');
let {exec} = require('child_process');

exec = promisify(exec);

module.exports = async () => {

    let processes = await promisify(ps.lookup)({command: 'motion'});
    let motion_proc = processes[0];

    const motion_conf_0 = process.env.MOTION_CONF;
    const motion_conf_1 = !!motion_proc ? (await exec(`pwdx ${motion_proc.pid}`)).split(':')[1] : null;
    const motion_conf_2 = `${homedir}/.motion/motion.conf`;
    const motion_conf_3 = `/etc/motion/motion.conf`;

    const motion_conf_list = [
        motion_conf_0,
        motion_conf_1,
        motion_conf_2,
        motion_conf_3
    ];

    let motion_conf;
    for (let conf of motion_conf_list) {
        try {
            await fs.access(conf);
            motion_conf = conf;
            break;
        } catch (_) { }
    }

    if (!motion_conf) {
        console.error('Could not find motion.conf, set it manually with MOTION_CONF env var');
        return;
    }

    async function readConfig(file) {
        let config = await fs.readFile(file);
        config = config.toString().split('\n');

        const transpose = (config, current) => {
            current = current.trim();
            if (current.length === 0 ||
                current.startsWith('#') ||
                current.startsWith(';')) {
                return config;
            }
            let key_value = current.split(' ');
            let key = key_value[0].trim().toLowerCase();
            let value = key_value[1].trim().toLowerCase();
            if (value === 'off') value = false;
            else if (value === 'on') value = true;
            if (config[key] !== undefined) {
                if (!Array.isArray(config[key])) {
                    // let first = config[key];
                    config[key] = [config[key]];
                    // config[key].push(first);
                }
                config[key].push(value);
            } else {
                config[key] = value;
            }
            return config;
        };

        return config.reduce(transpose, {});
    }

    const glob = await readConfig(motion_conf);
    let cameras = [];
    if (!!glob.camera) {
        cameras = await Promise.all(glob.camera.map(readConfig));
    }

    glob.motion_conf = motion_conf;

    return {
        glob,
        cameras,
        apply() {
            return this.cameras.map(camera => ({...this.glob, ...camera}));
        }
    };
};