const MotionApi = require('./motion-api');
const Camera = require('./camera');

const apiHost = process.env.API_HOST;
const streamHost = process.env.STREAM_HOST;

module.exports = class Provider {

    constructor(req) {
        let xhost = req && req.headers['X-Stream-Host'];
        this.api = new MotionApi(apiHost, {streamHost: xhost || streamHost});
    }

    getApi() {
        return this.api;
    }

    async getCameras() {
        return (await this.getApi().getCameras()).map(camera => new Camera(camera));
    }

    async getStreams() {
        const cameras = await this.getApi().getCameras();
        return await Promise.all(cameras.map(camera => camera.toObject()));
    };

};