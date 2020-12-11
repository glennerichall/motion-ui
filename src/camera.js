const db = require('./events/events');
const {Camera: MotionCamera} = require('./motion/motion-api');
const fs = require('fs').promises;
const fs_constants = require('fs').constants;

function getBuilder(options) {
    return db.getBuilder(options);
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
        const data = await this.getData(params);

        const unlinking = data?.map(async ({filename}) => {
            try {
                // https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback
                // Using fs.stat() to check for the existence of a file before
                // calling fs.open(), fs.readFile() or fs.writeFile() is not recommended.
                // Instead, user code should open/read/write the file directly and handle
                // the error raised if the file is not available.
                return await fs.unlink(filename);
            } catch (err) {}
            return Promise.resolve();
        });

        await Promise.all(unlinking);

        const [count, dataCount] = await getBuilder()
            .remove()
            .setCamera(this.getId())
            .setParams(params)
            .exec();

        console.log(`deleted ${count.changes} events and ${dataCount.changes} files`);
        return {
            events: count.changes,
            files: dataCount.changes
        };
    }

    // TODO: externalize into a serializer class

    async toStream() {
        return {
            url: this.getUrl(),
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