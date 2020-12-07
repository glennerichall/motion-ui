const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

const queryVersionSql = 'select * from migrations order by id desc limit 1;';
const bumpVersionSql = 'insert into migrations (version, installation) values(?, ?);';

const migpath = path.join(__dirname, 'migrations');

const crypto = require("crypto");

const initSql = `
    create table if not exists migrations
    (
        id integer not null
        constraint
            migrations_pk primary key autoincrement,
        version int not null,
        installation text not null
    );

    create
    unique index if not exists migrations_id_uindex
    on migrations (id);

create
    unique index if not exists migrations_version_uindex
    on migrations (version);
`;

class DatabaseManager {

    constructor(options) {
        this.options = options;
        this.prepared = {};
    }

    _initStatements() {
        this.queryVersionStmt = this.db.prepare(queryVersionSql);
        this.bumpVersionStmt = this.db.prepare(bumpVersionSql);
    }

    async bumpVersion(migVersion) {
        this.bumpVersionStmt.run(migVersion, new Date().toISOString());
    }

    async init() {
        this.db = new Database(this.options.name, {
            readonly: false
        });
        await this.db.exec(initSql);
        this._initStatements();
        await this.migrate();
    }

    async migrate() {
        const files = await fs.readdir(migpath);

        for (let file of files) {
            const curVersion = this.queryVersionStmt.get();
            const migVersion = file.match(/migrate\.(?<version>\d+)\.sql/).groups.version;
            if (curVersion === undefined || migVersion > curVersion.version) {
                const sql = (await fs.readFile(path.join(migpath, file))).toString();
                this.db.exec(sql);
                this.bumpVersion(migVersion);
            }
        }
    }

    getStatement(sql, params) {
        const key = crypto
            .createHash("MD5")
            .update(sql + JSON.stringify(params))
            .digest('hex');
        if (!this.prepared[key]) {
            for (let param in params) {
                const value = params[param];
                sql = sql.replace('$' + param, value);
            }
            this.prepared[key] = this.prepare(sql);
        }
        return this.prepared[key];
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

module.exports = DatabaseManager;