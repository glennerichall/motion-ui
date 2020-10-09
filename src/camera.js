const db = require('./events');

module.exports = class Camera {
    constructor(camera) {
        Object.assign(this, camera);
    }

    async getEvents() {
        let events = await db.getEvents(this.id);
    }
};