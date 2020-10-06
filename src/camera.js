const db = require('./events');

const MotionApi = require('./motion-api');
const apiHost = process.env.API_HOST;
const streamHost = process.env.STREAM_HOST;
const api = new MotionApi(apiHost, {streamHost});

module.exports = class Camera {

    constructor(camera) {
        Object.assign(this, camera);
    }

    async getEvents() {
        let events = await db.getEvents(this.id);
    }

    static async getCameras() {
        return (await api.getCameras()).map(camera => new Camera(camera));
    }

    static async getStreams() {
        const cameras = await api.getCameras();
        return await Promise.all(cameras.map(camera => camera.toObject()));
    };

};