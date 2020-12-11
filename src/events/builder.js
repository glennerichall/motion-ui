const {format} = require('date-fns');
const {
    queryEventsSql,
    queryEventCountSql,
    queryEventDataSql,
    deleteEventsSql,
    deleteEventDataSql,
    deleteEventsInListSql
} = require('./queries');

class Param {
    constructor(params) {
        this.params = {};

        this.transformParamValue = {};
        this.acceptParamValue = {};

        this.keys = Object.keys(params);

        for (let name in params) {
            const param = params[name];
            if (param?.value !== undefined) {
                this.params[name] = param.value;
            } else {
                this.params[name] = param;
            }
            if (param?.accept !== undefined) {
                this.acceptParamValue[name] = param.accept;
            } else {
                this.acceptParamValue[name] = () => true;
            }
            if (param?.transform !== undefined) {
                this.transformParamValue[name] = param.transform;
            } else {
                this.transformParamValue[name] = value => value;
            }
        }
    }

    setValues(params) {
        for (let name of this.keys) {
            const value = params[name];
            if (value !== undefined) {
                const accept = this.acceptParamValue[name];
                const transform = this.transformParamValue[name];
                if (accept(value)) {
                    this.params[name] = transform(value, this.params);
                }
            }
        }
        return this;
    }

    getValues() {
        return this.params;
    }
}

class QueryBuilder {
    constructor(events, {params = {}, fields = {}}) {
        this.events = events;
        this.params = new Param(params);
        this.fields = new Param(fields);
        this.sql = null;
        this.method = null;
    }

    setCamera(camera) {
        this.params.setValues({camera});
        return this;
    }

    setParams(params) {
        this.params.setValues(params);
        this.fields.setValues(params);
        return this;
    }

    getParams() {
        return this.params.getValues();
    }

    getFields() {
        return this.fields.getValues();
    }

    getSql() {
        return this.sql;
    }

    getStatement(sql, fields) {
        return this.events.getStatement(sql, fields);
    }

    getStatementMethod() {
        return this.method;
    }

    async send() {
        try {
            let sql = this.getSql();
            let params = this.getParams();
            let fields = this.getFields();
            const statement = this.getStatement(sql, fields);
            const method = this.getStatementMethod();
            return statement[method](params);
        } catch (e) {
            return null;
        }
    }
}

class NonRequestBuilder extends QueryBuilder {
    constructor(events, options) {
        super(events, options);
        this.method = 'run';
    }

    async exec() {
        return this.send();
    }
}

class RequestBuilder extends QueryBuilder {
    constructor(events, options) {
        super(events, options);
        this.method = 'all';
    }

    async fetch() {
        return this.send();
    }
}

const transformDate = date => {
    if (date === 'today') return format(new Date(), 'yyyy-MM-dd');
    return date;
};

const validateFields = accept =>
    fields => fields.split(',')
        .every(field => accept.includes(field.trim()));

const cartesian = (...a) => a.reduce(
    (a, b) => a.flatMap(
        d => b.map(
            e => [d, e].flat())));

class EventCountBuilder extends RequestBuilder {
    constructor(events) {
        super(events,
            {
                params: {
                    camera: null,
                    date: {
                        value: null,
                        transform: transformDate
                    }
                },
                fields: {
                    groupBy: {
                        accept: validateFields(['camera', 'date']),
                        transform: (value, params) => {
                            params.columns = '';
                            if (value !== null) {
                                params.columns = value.replace('date', "to_json(begin::date)#>>'{}' as date");
                                return `group by ${value.replace('date', 'begin::date')}`
                            }
                            return '';
                        },
                        value: ''
                    },
                    columns: ''
                }
            });
        this.sql = queryEventCountSql;
    }

    async fetch() {
        let count = await super.fetch();
        if (count.length === 1) count = count[0];
        return count;
    }
}

class EventBuilder extends RequestBuilder {
    constructor(events) {
        super(events,
            {
                params: {
                    camera: null,
                    date: {
                        value: null,
                        transform: transformDate
                    },
                    limit: null,
                },
                fields: {
                    orderBy: {
                        accept: value => this.validateOrderBy(value),
                        value: 1
                    }
                }
            });
        this.sql = queryEventsSql;
    }

    validateOrderBy(fields) {
        const validFields = ['camera', 'date', 'begin', 'done', 'id', 'event'];
        const validDirections = ['asc', 'desc'];

        return fields.split(',').every(
            field => {
                const [name, direction] = field.split(/\s+/);
                return validFields.includes(name.trim()) &&
                    (!direction || validDirections.includes(direction.trim()));
            });
    }

    async fetch() {
        let events = await super.fetch();
        const {limit} = this.getParams();
        if (events?.length === 1 && limit == 1) events = events[0];
        return events;
    }
}

class EventDataBuilder extends RequestBuilder {
    constructor(events) {
        super(events,
            {
                params: {
                    camera: null,
                    event: null,
                    date: {
                        transform: transformDate,
                        value: null
                    },
                    type: null
                }
            });
        this.sql = queryEventDataSql;
    }
}

class DeleteBuilder extends NonRequestBuilder {
    constructor(events) {
        super(events,
            {
                params: {
                    camera: null,
                    event: null,
                    date: {
                        transform: transformDate,
                        value: null
                    }
                }
            });
    }
}

class DeleteEventLogs extends DeleteBuilder {
    constructor(events) {
        super(events);
        this.sql = deleteEventsSql;
    }
}

class DeleteEventData extends DeleteBuilder {
    constructor(events) {
        super(events);
        this.sql = deleteEventDataSql;
    }
}

function toDispatcherProxy() {
    const targets = Array.from(arguments);
    return new Proxy({}, {
        get: (obj, prop) => {
            if (prop !== 'exec' && prop !== 'fetch') {
                return (...args) => toDispatcherProxy(...targets.map(target => target[prop](...args)));
            }
            return async (...args) => await Promise.all(targets.map(target => target[prop](...args)));
        }
    });
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

    remove() {
        return toDispatcherProxy(
            new DeleteEventLogs(this.database),
            new DeleteEventData(this.database),
        );
    }
}

module.exports = Builder;