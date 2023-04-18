import fetch from "node-fetch";
import {parse} from "../utils/config-parser.js";


const urls = {
    config_list: '{host}/{camid}/config/list',                // Lists all the configuration values for the camera.
    config_set: '{host}/{camid}/config/set?{param}={value1}',  //Set the value for the requested parameter
    config_get: '{host}/{camid}/config/get?query={param}',     // Return the value currently set for the parameter.
    config_write: '{host}/{camid}/config/write',              // Write the current parameters to the file.
    detection_status: '{host}/{camid}/detection/status',         // Return the current status of the camera.
    detection_connection: '{host}/{camid}/detection/connection',       // Return the connection status of the camera.
    detection_start: '{host}/{camid}/detection/start',           // Start or resume motion detection.
    detection_pause: '{host}/{camid}/detection/pause',           // Pause the motion detection.
    event_trigger_start: '{host}/{camid}/action/eventstart',     // Trigger a new event.
    event_trigger_end: '{host}/{camid}/action/eventend',         // Trigger the end of a event.
    action_snapshot: '{host}/{camid}/action/snapshot',        // Create a snapshot
    action_restart: '{host}/{camid}/action/restart',          // Shutdown and restart Motion
    action_quit: '{host}/{camid}/action/quit',                // Close all connections to the camera
    action_end: '{host}/{camid}/action/end',                  // Entirely shutdown the Motion application
    track_center: '{host}/{camid}/track/center',              // Send command to center PTZ camera
    track_x_y: '{host}/{camid}/track/set?x={value1}&y={value2}',         // Send command to PTZ camera to move to location specified by x and y
    track_pan_tilt: '{host}/{camid}/track/set?pan={value1}&tilt={value2}',    // Send command to PTZ camera to pan to value1 and tilt to value2
};

const snakeToCamel = (str) => str.replace(
    /(^[a-z]|[-_][a-z])/g,
    (group) => group.toUpperCase()
        .replace('-', '')
        .replace('_', '')
);

const patternStatus = /Camera\s(?<id>.+)Detection status\s(?<status>NOT RUNNING|ACTIVE)/;
const patternConnection1 = /Camera\s(?<name>.+)\sCamera\s(?<id>.+)\s--\s${name}\s(?<status>Lost connection|NOT RUNNING|Connection OK)/;
const patternConnection2 = /Camera\s(?<id>.+)\s--\s(?<name>.+)\s(?<status>Lost connection|NOT RUNNING|Connection OK)/;

export class Camera {
    constructor(api, id, name, status, configs) {
        this.api = api;
        this.id = id;
        this.name = name || null;
        this.configs = configs || null;
    }

    getId() {
        return this.id;
    }

    async getConfigs() {
        if (!this.configs) {
            const configs = await this.api.requestConfigList(this.id);
            this.configs = parse(configs, '=');
        }
        return this.configs;
    }

    async getStatus() {
        // let status = await this.api.requestDetectionConnection(this.id);
        // status = status && status.replace('\n', '').match(patternStatus)[2];
        const connection = await this.api.requestDetectionConnection(this.id);
        let match = connection.match(patternConnection1);
        if (!match) match = connection.match(patternConnection2);
        if (!match) return null;
        const {status} = match.groups;
        return status.toLowerCase().replace(' ', '-');
    }

    async getName() {
        if (!this.name) {
            const connection = await this.api.requestDetectionConnection(this.id);
            this.name = connection && connection.replace('\n', '').match(patternConnection)[1];
        }
        return this.name;
    }

    async setDetection(value) {
        if (value) {
            await this.api.requestDetectionStart(this.id);
        } else {
            await this.api.requestDetectionPause(this.id);
        }
    }

    getHost() {
        return this.api.getStreamHost();
    }

    async getUrl() {
        return `${await this.getHost()}/${this.getId()}/stream`
    }

    async requestConfig(param) {
        return (await this.api.requestConfigGet(this.getId(), {param})).split('\n')
            [1].split('=')[1].trim();
    }

    getTargetDir() {
        return this.requestConfig('target_dir');
    }

    getNetCamUrl() {
        return this.requestConfig('netcam_url');
    }

    getNetCamHighRes() {
        return this.requestConfig('netcam_highres');
    }

    getWidth() {
        return this.requestConfig('width');
    }

    getHeight() {
        return this.requestConfig('height');
    }

    getFrameRate() {
        return this.requestConfig('framerate');
    }

    getPostCapture() {
        return this.requestConfig('post_capture');
    }

    getPreCapture() {
        return this.requestConfig('pre_capture');
    }

    getEventGap() {
        return this.requestConfig('event_gap');
    }

    getStreamPort() {
        return this.requestConfig('stream_port');
    }

    record() {
        return this.api.requestEventTriggerStart(this.id);
    }
}

class WebControl {
    constructor(apiHost, motionHost, streamHost) {
        this.apiHost = apiHost;
        this.motionHost = motionHost;
        this.streamHost = streamHost;

        for (let key in urls) {
            let method = 'request' + snakeToCamel(key);
            this[method] = async (camid, options) => this.requestText(urls[key], camid, options);
        }
    }

    async getStreamHost() {
        if (!this.streamHost) {
            const streamPort = await new Camera(this).getStreamPort();
            const url = new URL(this.motionHost);
            const {protocol, hostname} = url;
            this.streamHost = `${protocol}//${hostname}:${streamPort}`;
        }
        return this.streamHost;
    }

    getUrl(url, camid, options = {}) {
        let res = url
            .replace('{host}', this.apiHost)
            .replace('{camid}', camid || '0');

        for (let key in options) {
            res = res.replace(`{${key}}`, options[key]);
        }
        return res;
    }

    request(url, camid, options) {
        return fetch(this.getUrl(url, camid, options));
    }

    async requestText(url, camid, options) {
        let response = await this.request(url, camid, options);
        return response.text();
    }
}


export class MotionApi {
    constructor(apiHost, motionHost, options) {
        this.options = options || {};
        this.cameras = {};
        this.api = new WebControl(apiHost,motionHost,
            this.options.streamHost);
    }

    async init() {
        await this.api.init();
    }

    async getCameraIds() {
        const response = await this.api.requestDetectionStatus();
        const cameras = response.split('\n').filter(x => x.trim().length);
        return cameras.map(camera => camera.match(patternStatus).groups.id.trim());
    }

    getLogFile() {
        return this.getCamera(0).requestConfig('log_file');
    }

    async getCameras() {
        const connection = await this.api.requestDetectionConnection();
        return connection
            .split('\n')
            .slice(1)
            .filter(x => x.trim().length)
            .map(camera => {
                let match = camera.match(patternConnection1);
                if (!match) match = camera.match(patternConnection2);
                if (!match) return null;
                const {groups: {id, name, status}} = match;
                return this.newCamera(
                    this.api,
                    id.trim(),
                    name.trim(),
                    status.toLowerCase()
                        .replace(' ', '-'));
            });
    }

    getCamera(id) {
        return this.newCamera(this.api, id);
    }

    newCamera(...args) {
        return new Camera(...args);
    }
}
