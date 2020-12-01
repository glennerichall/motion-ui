const {format} = require('date-fns');
const {
    queryEventsSql,
    queryEventCountSql,
    queryForEventData
} = require('./queries');

class RequestBuilder {
    constructor(events) {
        this.events = events;
        this.params = {
            camera: null,
            date: null
        };
        this.sql = null;
        this.fields = {};
    }

    for(camera) {
        this.params = {
            ...this.params,
            camera
        };
        return this;
    }

    at(date) {
        this.params = {
            ...this.params,
            date
        };
        return this;
    }

    today() {
        return this.at(format(new Date(), 'yyyy-MM-dd'));
    }

    apply(params) {
        if (params.date === 'today') this.today();
        else if (params.date) this.at(params.date);

        if (params.camera) this.for(params.camera);
        return this;
    }

    getParams() {
        return this.params;
    }

    getFields() {
        return this.fields;
    }

    getSql() {
        return this.sql;
    }

    getStatement(sql, fields) {
        return this.events.getStatement(sql, fields);
    }

    async fetch() {
        try {
            let sql = this.getSql();
            let params = this.getParams();
            let fields = this.getFields();
            const statement = this.getStatement(sql, fields);
            return statement.all(params);
        } catch (e) {
            return null;
        }
    }
}

class EventCountBuilder extends RequestBuilder {
    constructor(events) {
        super(events)
        this.fields = {
            ...this.fields,
            groupby: null
        }
        this.sql = queryEventCountSql;
    }

    groupBy(fields) {
        // fields may only contain camera or date
        const validFields = ['camera', 'date'];
        if (fields.split(',').every(field => validFields.includes(field))) {
            this.fields = {
                ...this.fields,
                groupby: fields
            }
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
        let {camera} = this.getParams();
        let {groupby} = this.getFields();
        groupby = groupby ? groupby.split(',') : [];
        if (!groupby.includes('camera') && !camera) {
            count.forEach(elem => delete elem.camera);
        }
        if (!groupby.includes('date')) {
            count.forEach(elem => delete elem.date);
        }
        if (count.length === 1) count = count[0];
        return count;
    }
}

class EventBuilder extends RequestBuilder {
    constructor(events) {
        super(events)
        this.params = {
            ...this.params,
            limit: null
        };
        this.fields = {
            ...this.fields,
            orderby: null
        }
        this.sql = queryEventsSql;
    }

    apply(params) {
        super.apply(params);
        if (params.orderBy) this.orderBy(params.orderBy);
        if (params.limit) this.limit(params.limit);
        return this;
    }

    orderBy(fields) {
        const validFields = ['camera', 'date', 'begin', 'end', 'id', 'event'];
        const validDirections = ['asc', 'desc'];

        if (fields.split(',').every(
            field => {
                const [name, direction] = field.split(/\s+/);
                return validFields.includes(name.trim()) &&
                    (!direction || validDirections.includes(direction.trim()));
            })) {
            this.fields = {
                ...this.fields,
                orderby: fields
            }
        }
        return this;
    }

    limit(n) {
        this.params = {
            ...this.params,
            limit: n
        };
        return this;
    }

    async fetch() {
        let events = await super.fetch();
        const {limit} = this.getParams();
        if (events.length === 1 && limit == 1) events = events[0];
        return events;
    }
}

class EventDataBuilder extends RequestBuilder {
    constructor(events) {
        super(events)
        this.params = {
            ...this.params,
            event: null
        }
        this.sql = queryForEventData;
    }

    apply(params) {
        super.apply(params);
        if (params.event) this.event(params.event);
        return this;
    }

    event(event) {
        this.params = {
            ...this.params,
            event
        }
    }

    async fetch() {
        let events = await super.fetch();
        return events;
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

    data() {
        return new EventDataBuilder(this.database);
    }
}

module.exports = Builder;