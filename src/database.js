const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

const queryVersionSql = 'select * from migrations order by id desc limit 1;';
const updateVersionSql = 'insert into migrations (version, installation) values(?, ?);';

const migpath = path.join(__dirname, 'migrations');
const initSql = path.join(migpath, 'migrate.1.sql');

class Events {

    constructor(options) {
        this.options = options;
    }

    _initStatements() {
        this.queryVersionStmt = this.db.prepare(queryVersionSql);
        this.updateVersionStmt = this.db.prepare(updateVersionSql);
    }

    async updateVersion(migVersion) {
        this.updateVersionStmt.run(migVersion, new Date().toISOString());
    }

    async init() {
        this.db = new Database(this.options.name, this.options);
        try {
            this._initStatements();
        } catch (e) {
            const sql = (await fs.readFile(initSql)).toString();
            await this.db.exec(sql);
            this._initStatements();
            this.updateVersion(1);
        }
    }

    async migrate() {
        const files = await fs.readdir(migpath);
        const curVersion = this.queryVersionStmt.get();
        for (let file of files) {
            const migVersion = file.match(/migrate\.(?<version>\d+)\.sql/).groups.version;
            if (migVersion > curVersion) {
                const sql = (await fs.readFile(file)).toString();
                this.db.exec(sql);
                this.updateVersion(migVersion);
            }
        }
    }

    prepare(sql) {
        return this.db.prepare(sql);
    }
}

module.exports = Events;