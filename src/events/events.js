const Builder = require("./builder");

const Database = require('../database');
const options = {
    name: process.env.EVENTS || './motion.db'
};

const queriesSql = require('./queries');

class Events extends Database {
    constructor(options) {
        options = options || {};
        super({
            readonly: true,
            ...options
        });
    }

    async init() {
        await super.init();
        for (let sql in queriesSql) {
            const key = sql.replace(/Sql$/, 'Stmt');
            this[key] = this.db.prepare(queriesSql[sql]);
        }
    }

    getBuilder(options = {}) {
        return new Builder(this);
    }
}

module.exports = new Events(options);