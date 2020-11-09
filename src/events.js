const Database = require('./database');
const moment = require('moment');
const options = {
    name: process.env.EVENTS || './motion.db'
};

const queryEventsSql = 'select * from event_logs where camera = ? order by event';

const countEventsSql = `
    select camera, 
           count(distinct event) as total 
    from event_logs
    where (camera = @camera OR @camera IS NULL)
    group by camera
`;

const countByDayEventsSql = `
    select camera,
           count(distinct event)      as total,
           strftime('%Y-%m-%d', begin) as date
    from event_logs
    where (strftime('%Y-%m-%d', @date) = date OR @date IS NULL)
      AND (camera = @camera OR @camera IS NULL)
    group by camera, date
`;

class Builder {
    constructor(events) {
        this.events = events;
        this.camera = null;
        this.all();
    }

    for(camera) {
        this.camera = camera;
        return this;
    }

    today() {
        return this.at(new Date());
    }

    at(date) {
        this.statement = this.events.countByDayEventsStmt;
        this.date = date;
        return this;
    }

    everyDay() {
        this.statement = this.events.countByDayEventsStmt;
        this.date = null;
        return this;
    }

    all() {
        this.statement = this.events.countEventsStmt;
        this.date = undefined;
        return this;
    }

    async fetch() {
        let {camera, statement, date} = this;
        let fetch = (camera !== null ? statement.get : statement.all).bind(statement);
        date = !date ? null : moment(date).format('YYYY-MM-DD hh:mm:ss');
        let count = await fetch({camera, date});
        return count || {camera, date, total: 0}
    }
}

class Events extends Database {
    constructor(options) {
        super(options);
    }

    async init() {
        await super.init();
        this.queryEventsStmt = this.db.prepare(queryEventsSql);
        this.countEventsStmt = this.db.prepare(countEventsSql);
        this.countByDayEventsStmt = this.db.prepare(countByDayEventsSql);
    }

    async getEvents(camera) {
        let events = await this.queryEventsStmt.all(camera);
        return events;
    }

    getEventCount() {
        return new Builder(this);
    }

}

module.exports = new Events(options);