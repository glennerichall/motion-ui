const db = require('./events');
const {Camera: MotionCamera} = require('./motion-api');

module.exports.Camera = class Camera extends MotionCamera {
    constructor(...args) {
        super(...args);
    }

    async getEvents() {
        let events = await db.getEvents(this.id);
        console.log(events);
    }

    async getEventCount() {
        let count = await db.getEventCount(this.id);
        return count;
    }

    async toObject() {
        let o = await super.toObject();
        o.eventCount = await this.getEventCount();
        return o;
    }
};