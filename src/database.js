const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

const queryVersionSql = 'select * from migrations order by id desc limit 1;';
const bumpVersionSql = 'insert into migrations (version, installation) values(?, ?);';

const migpath = path.join(__dirname, 'migrations');

const initSql = `
create table if not exists migrations
(
    id integer not null
        constraint migrations_pk
            primary key autoincrement,
    version      int     not null,
    installation text    not null
);

create unique index if not exists migrations_id_uindex
    on migrations (id);

create unique index if not exists migrations_version_uindex
    on migrations (version);
`;

class Events {

    constructor(options) {
        this.options = options;
    }

    _initStatements() {
        this.queryVersionStmt = this.db.prepare(queryVersionSql);
        this.bumpVersionStmt = this.db.prepare(bumpVersionSql);
    }

    async bumpVersion(migVersion) {
        this.bumpVersionStmt.run(migVersion, new Date().toISOString());
    }

    async init() {
        this.db = new Database(this.options.name, this.options);
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
                const sql = (await fs.readFile(path.join(migpath,file))).toString();
                this.db.exec(sql);
                this.bumpVersion(migVersion);
            }
        }
    }

    prepare(sql) {
        return this.db.prepare(sql);
    }
}

module.exports = Events;