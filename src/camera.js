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

        events.forEach(event => {
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
};