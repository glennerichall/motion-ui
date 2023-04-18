import {homedir} from "os";
import {promises as fs} from "fs";
import ps from "ps-node";
import {promisify} from "util";
import {exec} from "child_process";
import {parse} from "../utils/config-parser";

const homedir = homedir();


exec = promisify(exec);

export default async () => {

    let processes = await promisify(ps.lookup)({command: 'motion'});
    let motion_proc = processes[0];

    const motion_conf_0 = process.env.MOTION_CONF;
    let proc_dir;
    if (!!motion_proc) {
        proc_dir = await exec(`pwdx ${motion_proc.pid}`);
        proc_dir = proc_dir.stdout.split(':')[1].trim();
    }
    const motion_conf_1 = `${proc_dir}motion.conf`;
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
        return parse(config);
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
}