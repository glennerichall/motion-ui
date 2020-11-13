const Database = require('./database');
const {format} = require('date-fns');
const options = {
    name: process.env.EVENTS || './motion.db'
};

const queryEventsSql = 'select * from event_logs where camera = ? order by event';

const queryEventCountSql = `
    select camera,
           count(distinct event)       as total,
           strftime('%Y-%m-%d', begin) as date
    from event_logs
    where end is not null
      AND
        (strftime('%Y-%m-%d', @date) = date
            OR
         @date = 'latest' AND date = (select max(strftime('%Y-%m-%d', begin))
                                      from event_logs as el
                                      where el.camera = event_logs.camera)
            OR
         @date IS NULL)
      AND (camera = @camera OR @camera IS NULL)
    group by camera,
             case
                 when @date = 'latest' then 1
                 else date
                 end;
`;

const queryLastEventSql = `
    select max(begin) as begin,
           id,
           event,
           end,
           camera
    from event_logs
    where end is not null
      and (strftime('%Y-%m-%d', @date) = begin OR
           @date = 'latest' OR
           @date IS NULL)
      and (camera = @camera or @camera is null)
    group by camera,
             case
                 when @date = 'latest' then 1
                 else strftime('%Y-%m-%d', begin)
                 end
`;

class Builder {
    constructor(events) {
        this.events = events;
        this.camera = null;
        this.everyDay();
    }

    for(camera) {
        this.camera = camera;
        return this;
    }

    today() {
        return this.at(new Date());
    }

    at(date) {
        this.date = format(date, 'yyyy-MM-dd');
        return this;
    }

    everyDay() {
        this.date = null;
        return this;
    }

    latest() {
        this.date = 'latest';
        return this;
    }

    count() {
        this.statement = this.events.queryEventCountStmt;
        return this;
    }

    last()  {
        this.statement = this.events.queryLastEventStmt;
        return this;
    }

    async fetch() {
        let {camera, statement, date} = this;
        let fetch = (camera !== null ? statement.get : statement.all).bind(statement);
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
        this.queryEventCountStmt = this.db.prepare(queryEventCountSql);
        this.queryLastEventStmt = this.db.prepare(queryLastEventSql);
    }

    async getEvents(camera) {
        let events = await this.queryEventsStmt.all(camera);
        return events;
    }

    getLastEvent(camera) {
        return this.queryLastEventStmt.get({camera});
    }

    getBuilder() {
        return new Builder(this);
    }
}

module.exports = new Events(options);