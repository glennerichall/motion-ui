const database = require('./database');
const {Camera: MotionCamera} = require('./motion/motion-api');
const fs = require('fs').promises;
const addSeconds = require('date-fns/addSeconds');
const formatDuration = require('date-fns/formatDuration');
const intervalToDuration = require('date-fns/intervalToDuration');

function getBuilder(options) {
    return database.getBuilder(options);
}

module.exports.Camera = class Camera extends MotionCamera {
    constructor(...args) {
        super(...args);
    }

    async init() {
        const targetDir = await this.getTargetDir();
        try {
            await fs.mkdir(targetDir);
        } catch (e) {}
        return true;
    }

    async getData(params) {
        const events = await getBuilder()
            .data()
            .setCamera(this.getId())
            .setParams(params)
            .fetch();

        return events;
    }

    async getEvents(params) {
        const events = await getBuilder()
            .events()
            .setCamera(this.getId())
            .setParams(params)
            .fetch();

        const [eventGap,
            postCapture,
            preCapture,
            frameRate] = await Promise.all([
            this.getEventGap(),
            this.getPostCapture(),
            this.getPreCapture(),
            this.getFrameRate()]);


        const frameDuration = 1 / frameRate;

        const update = event => {
            let {begin, done} = event;
            begin = addSeconds(new Date(begin), -preCapture * frameDuration);
            done = addSeconds(new Date(done), -eventGap);
            const duration = intervalToDuration({
                start: begin,
                end: done
            });
            event.begin = begin.toISOString();
            event.done = done.toISOString();
            event.duration = formatDuration(duration);
        }

        if (Array.isArray(events)) {
            for (let event of events) {
                update(event);
            }
        } else {
            update(events);
        }
        return events;
    }

    async getEventCount(params) {
        const count = await getBuilder()
            .count()
            .setCamera(this.getId())
            .setParams(params)
            .fetch();

        return count;
    }

    async deleteEvents(params) {
        const count = await getBuilder()
            .remove()
            .setCamera(this.getId())
            .setParams(params)
            .exec();

        console.log(`marked ${count?.length} events for deletion`);
        return {
            events: count?.length
        };
    }

    // TODO: externalize into a serializer class

    async toStream() {
        return {
            url: await this.getUrl(),
            id: this.getId(),
            name: await this.getName(),
            status: await this.getStatus()
        }
    }

    async toDetails() {
        const netCamHighRes = this.getNetCamHighRes();
        const netCamUrl = this.getNetCamUrl();
        const width = this.getWidth();
        const height = this.getHeight();
        const status = this.getStatus();

        return {
            id: this.getId(),
            netCamHighResUrl: await netCamHighRes,
            netCamUrl: await netCamUrl,
            width: await width,
            height: await height,
            status: await status
        };
    }

    async toStatus() {
        return {
            id: this.getId(),
            status: await this.getStatus()
        };
    }
};