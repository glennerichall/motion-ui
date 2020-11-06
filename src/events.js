const Database = require('./database');
const options = {
    name: process.env.EVENTS || './motion.db'
};

const queryEventsSql = 'select * from events where camera = ? order by event, time';
const countEventsSql = 'select camera, count(distinct event) as total from events where camera = @camera OR @camera IS NULL group by camera'

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

    async getEventCount(camera) {
        camera = camera || null;
        if(camera == null){
            let count = this.countEventsStmt.all({camera});
            return count;
        }
        let count = this.countEventsStmt.get({camera});
        return count || {camera, total: 0};
    }
}

module.exports = new Events(options);