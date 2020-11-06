const Database = require('./database');
const options = {
    name: './motion.db'
};

const queryEventsSql = 'select * from events where camera = ? order by event';
const countEventsSql = 'select count(*) as total from events where camera = ? order by event';

class Events extends Database {
    constructor(options) {
        super(options);
    }

    async init() {
        await super.init();
        this.queryEventsStmt = this.db.prepare(queryEventsSql);
        this.countEventsStmt = this.db.prepare(countEventsSql);
    }

    async getEvents(camera) {
        let events = await this.queryEventsStmt.all(camera);
        return events;
    }

    getEventCount(camera) {
        return this.countEventsStmt.get(camera).total;
    }
}

module.exports = new Events(options);