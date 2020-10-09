const Database = require('./database');
const options = {
    name: './motion.db'
};

const queryEventsSql = 'select * from events where camera = ? order by event';

class Events extends Database {
    constructor(options) {
        super(options);
    }

    async init() {
        await super.init();
        this.queryEventsStmt = this.db.prepare(queryEventsSql);
    }

    async getEvents(camera) {
        let events = await this.queryEventsStmt.all(camera);
        return events;
    }
}

module.exports = new Events(options);