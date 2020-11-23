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
        this.req = req;
    }

    getApi() {
        return this.api;
    }

    getCamera(){
        const {camera} = this.req.params;
        return this.getApi().getCamera(camera || null);
    }

    async getCameras() {
        return await this.getApi().getCameras();
    }

    async getStreams() {
        const cameras = await this.getCameras();
        return await Promise.all(cameras.map(camera => camera.toObject()));
    };

};