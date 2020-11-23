const {format} = require('date-fns');

class RequestBuilder {
    constructor(events) {
        this.events = events;
        this.params = {
            camera: null,
            date: null
        };
        this.statement = null;
    }

    for(camera) {
        this.params = {
            ...this.params,
            camera
        };
        return this;
    }

    at(date) {
        date = format(date, 'yyyy-MM-dd');
        this.params = {
            ...this.params,
            date
        };
        return this;
    }

    today() {
        return this.at(new Date());
    }

    apply(params) {
        if (params.date === 'today') this.today();
        else if (params.date) this.at(params.date);

        if (params.camera) this.for(params.camera);
        return this;
    }

    async fetch() {
        try {
            let {statement, params} = this;
            return statement.all(params);
        } catch (e) {
            return null;
        }
    }
}

class EventCountBuilder extends RequestBuilder {
    constructor(events) {
        super(events)
        this.statement = this.events.queryEventCountStmt;
        this.params = {
            ...this.params,
            groupbycamera: null,
            groupbydate: null
        }
    }

    groupBy(groups) {
        if (!Array.isArray(groups)) groups = groups.split(',');
        this.params = {
            ...this.params,
            groupbycamera: groups.includes('camera') ? 1 : 0,
            groupbydate: groups.includes('date') ? 1 : 0
        }
        return this;
    }

    apply(params) {
        super.apply(params);
        if (params.groupBy) this.groupBy(params.groupBy);
        return this;
    }

    async fetch() {
        let count = await super.fetch();
        let {groupbycamera, groupbydate, camera} = this.params;
        if (!groupbycamera && !camera) {
            count.forEach(elem => delete elem.camera);
        }
        if (!groupbydate) {
            count.forEach(elem => delete elem.date);
        }
        if(count.length === 1) count = count[0];
        return count;
    }
}

class EventBuilder extends RequestBuilder {
    constructor(events) {
        super(events)
        this.statement = this.events.queryEventsStmt;
    }
}

class Builder {
    constructor(database) {
        this.database = database;
    }

    count() {
        return new EventCountBuilder(this.database);
    }

    events() {
        return new EventBuilder(this.database);
    }
}

module.exports = Builder;