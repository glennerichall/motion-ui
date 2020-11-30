const db = require('./events/events');
const {Camera: MotionCamera} = require('./motion-api');

function getBuilder(options) {
    return db.getBuilder(options);
}

module.exports.Camera = class Camera extends MotionCamera {
    constructor(...args) {
        super(...args);
    }


    async getEvents(params) {
        const events = await getBuilder()
            .events()
            .for(this.getId())
            .apply(params)
            .fetch();

        let targetDir = await this.getTargetDir();

        events.forEach && events.forEach(event => {
            if (event.filename) {
                event.filename = event.filename.replace(targetDir, '');
            }
        });

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