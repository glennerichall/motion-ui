const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

const queryVersionSql = 'select * from version order by id desc limit 1;';

class Events {

    constructor(options) {
        this.options = options;

    }

    async init() {
        this.db = new Database(this.options.name, this.options);
        this.queryVersion = this.db.prepare(queryVersionSql);
    }

    async migrate() {
        const files = await fs.readdir(path.join(__dirname, 'migrations'));
        const curVersion = this.queryVersion.get();
        for (let file of files) {
            const migVersion = file.match(/migrate\.(?<version>\d+)\.sql/).groups.version;
            if (migVersion > curVersion) {
                const sql = (await fs.readFile()).toString();
                this.db.exec(sql);

            }
        }
    }
}