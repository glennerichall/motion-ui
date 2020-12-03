const db = require('./events/events');
const {Camera: MotionCamera} = require('./motion-api');
const fs = require('fs').promises;
const fs_constants = require('fs').constants;

function getBuilder(options) {
    return db.getBuilder(options);
}

module.exports.Camera = class Camera extends MotionCamera {
    constructor(...args) {
        super(...args);
    }

    async getData(params, {stripTargetDir = true}) {
        const events = await getBuilder()
            .data()
            .for(this.getId())
            .apply(params)
            .fetch();

        if (stripTargetDir) {
            let targetDir = await this.getTargetDir();
            events?.forEach(event => {
                if (event.filename) {
                    event.filename = event.filename.replace(targetDir, '');
                }
            });
        }

        return events;
    }

    async getEvents(params) {
        const events = await getBuilder()
            .events()
            .for(this.getId())
            .apply(params)
            .fetch();
        return events;
    }

    async getEventCount(params) {
        const count = await getBuilder()
            .count()
            .for(this.getId())
            .apply(params)
            .fetch();

        return count;
    }

    async deleteEvents(params) {
        const data = await this.getData(params, {stripTargetDir: false});

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
            .for(this.getId())
            .apply(params)
            .exec();

        console.log(`deleted ${count} events and ${dataCount} files`);
        return {
            events: count,
            files: dataCount
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

        return {
            id: this.getId(),
            netCamHighResUrl: await netCamHighRes,
            netCamUrl: await netCamUrl,
            width: await width,
            height: await height
        };
    }

    async toStatus() {
        return {
            id: this.getId(),
            status: await this.getStatus()
        };
    }
};