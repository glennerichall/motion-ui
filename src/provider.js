const {MotionApi} = require('./motion-api');
const {Camera} = require('./camera');
const db = require('./events/events');

const apiHost = process.env.API_HOST;
const streamHost = process.env.STREAM_HOST;

module.exports = class Provider {

    constructor(req) {
        let xhost = req?.header ? req.header('X-Stream-Host') : null;
        this.api = new MotionApi(apiHost, {streamHost: xhost || streamHost});
        this.api.newCamera = function (...args) {
            return new Camera(...args);
        }
        this.req = req;
        this.camera = req?.params?.camera;
    }

    getApi() {
        return this.api;
    }

    getCamera() {
        return this.getApi().getCamera(this.camera || null);
    }

    async getCameras() {
        return await this.getApi().getCameras();
    }

    async getStreams() {
        const cameras = await this.getCameras();
        return await Promise.all(cameras.map(camera => camera.toStream()));
    };

};