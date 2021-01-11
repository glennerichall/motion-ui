const {MotionApi} = require('./motion-api');
const {Camera} = require('../camera');

const apiHost = process.env.MOTION_HOST  ?? 'http://localhost:8080';

module.exports = class Provider {

    constructor(req) {
        const streamHost = req?.header('X-Stream-Host') ?? null;
        const host = process.env.MOTION_HOST ?? `${req?.protocol}://${req?.header('host')}`;
        this.api = new MotionApi(apiHost, {streamHost, host});
        this.api.newCamera = (...args) => new Camera(...args);
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