const fetch = require('node-fetch');
const {parse} = require('./config-parser');

const urls = {
    config_list: '{host}/{camid}/config/list',                // Lists all the configuration values for the camera.
    config_set: '{host}/{camid}/config/set?{parm}={value1}',  //Set the value for the requested parameter
    config_get: '{host}/{camid}/config/get?query={parm}',     // Return the value currently set for the parameter.
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
const patternConnection1 = /Camera\s(?<name>.+)\sCamera\s(?<id>.+)\s--\s${name}\s(?<status>NOT RUNNING|Connection OK)/;
const patternConnection2 = /Camera\s(?<id>.+)\s--\s(?<name>.+)\s(?<status>NOT RUNNING|Connection OK)/;

class Camera {
    constructor(api, id, name, configs) {
        this.api = api;
        this.id = id;
        this.name = name || null;
        this.status = null;
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
        if (!this.status) {
            const status = await this.api.requestDetectionStatus(this.id);
            this.status = status && status.replace('\n', '').match(patternStatus)[2];
        }
        return this.status;
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

    async toObject() {
        return {
            url: `${this.api.streamHost}/${await this.getId()}/stream`,
            id: await this.getId(),
            name: await this.getName()
        }
    }
}

class WebControl {
    constructor(apiHost, streamHost) {
        this.host = apiHost;
        this.streamHost = streamHost;

        for (let key in urls) {
            let method = 'request' + snakeToCamel(key);
            this[method] = async (camid) => this.requestText(urls[key], camid);
        }
    }

    getUrl(url, camid) {
        return url
            .replace('{host}', this.host)
            .replace('{camid}', camid || '0');
    }

    request(url, camid) {
        return fetch(this.getUrl(url, camid));
    }

    async requestText(url, camid) {
        let response = await this.request(url, camid);
        return response.text();
    }
}


class MotionApi {
    constructor(apiHost, options) {
        this.options = options || {};
        this.cameras = {};
        this.api = new WebControl(apiHost, this.options.streamHost || apiHost);
    }

    async getCameraIds() {
        const response = await this.api.requestDetectionStatus();
        const cameras = response.split('\n').filter(x => x.trim().length);
        return cameras.map(camera => camera.match(patternStatus).groups.id.trim());
    }

    async getCameras() {
        const connection = await this.api.requestDetectionConnection();
        return connection
            .split('\n')
            .slice(1)
            .filter(x => x.trim().length)
            .map(camera => {
                let match = camera.match(patternConnection1);
                if(!match) match = camera.match(patternConnection2);
                if(!match) return null;
                const {groups:{id, name}} = match;
                return new Camera(this.api, id.trim(), name.trim());
            });
    }

    getCamera(id) {
        return new Camera(this.api, id);
    }

}

module.exports = MotionApi;