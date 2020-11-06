const {MotionApi} = require('./motion-api');
const {Camera} = require('./camera');

const apiHost = process.env.API_HOST;
const streamHost = process.env.STREAM_HOST;

module.exports = class Provider {

    constructor(req) {
        let xhost = req && req.header('X-Stream-Host');
        this.api = new MotionApi(apiHost, {streamHost: xhost || streamHost});
        this.api.newCamera = function (...args) {
            return new Camera(...args);
        }
    }

    getApi() {
        return this.api;
    }

    async getCameras() {
        return await this.getApi().getCameras();
    }

    async getStreams() {
        const cameras = await this.getCameras();
        return await Promise.all(cameras.map(camera => camera.toObject()));
    };

};