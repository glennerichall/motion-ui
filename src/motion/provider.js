import {MotionApi} from "./motion-api.js";

import {Camera} from "../camera.js";


const apiHost = process.env.MOTION_HOST ?? 'http://localhost:8080';

class ProviderBuilder {
    constructor(provider) {
        this.provider = provider;
    }

    build(req) {
        this.initWithReq(req);
        this.provider.api.newCamera = (...args) => new Camera(...args);
        this.provider.req = req;
        return this.provider;
    }

    initWithReq(req) {
        let streamHost = null;

        // By default, motion is on the same host as its api.
        // MotionApi class will fetch the stream port from motion api.
        // So any port set for motion api in apiHost will be replaced by the port returned by the api.
        let motionHost = apiHost;
        if (req?.header) {
            // this header is set by a reverse proxy to force the stream url of cameras.
            streamHost = req.header('X-Stream-Host') ?? null;

            // if the env var is set, use it since motion may be on another machine
            if (process.env.MOTION_HOST) {
                motionHost = process.env.MOTION_HOST;
            }

                // If this provider is instantiated from a http request, use the same
            // host and protocol as the request.
            else if (req.protocol) {
                motionHost = `${req.protocol}://${req.header('host')}`;
            }
        }
        this.provider.api = new MotionApi(apiHost, motionHost, {streamHost});
        this.provider.camera = req?.params?.camera;
    }


}

export default class Provider {

    constructor(req) {
        new ProviderBuilder(this).build(req);
    }

    getApi() {
        return this.api;
    }

    update() {
        // TODO. Save some motion cofigs in the database like the camera dirs.
        // TODO. If the dir changes, delete all files from the old dirs
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

}