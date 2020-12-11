const Sqlite = require('better-sqlite3');
const Database = require('./database');

class SQliteDatabase extends Sqlite{

    constructor(options) {
        super(options);
    }

    async init() {
        this.db = new Database(this.options.name, {
            readonly: false
        });
        await super.init();
    }

    prepare(sql) {
        return this.db.prepare(sql);
    }

    exec(sql) {
        this.db.exec(sql);
        return this;
    }

    close(){
        this.db.close();
        return this;
    }
}

module.exports = SQliteDatabase;