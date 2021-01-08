const fs = require('fs').promises;
const path = require('path');

const queryVersionSql = 'select * from migrations order by version desc limit 1;';
const bumpVersionSql = 'insert into migrations (version, installation) values(@version, @date);';

const migpath = path.join(__dirname, '..', 'migrations');

const initSql = `
    create table if not exists migrations
    (
        id           serial    not null
            constraint migrations_pk
                primary key,
        version      integer   not null,
        installation timestamp not null
    );

    create unique index if not exists migrations_id_uindex
        on migrations (id);
`;


module.exports = class Migrator {
    constructor(database) {
        this.database = database;
    }

    _initStatements() {
        this.queryVersionStmt = this.database.prepare(queryVersionSql);
        this.bumpVersionStmt = this.database.prepare(bumpVersionSql);
    }

    async bumpVersion(migVersion) {
        this.bumpVersionStmt.run({
            version: migVersion,
            date: new Date().toISOString()
        });
    }

    async migrate() {
        const files = await fs.readdir(migpath);

        for (let file of files) {
            const curVersion = await this.queryVersionStmt.get();
            const migVersion = file.match(/migrate\.(?<version>\d+)\.sql/).groups.version;
            if (curVersion === undefined || curVersion === null || migVersion > curVersion.version) {
                const sql = (await fs.readFile(path.join(migpath, file))).toString();
                try {
                    await this.database.exec(sql);
                    await this.bumpVersion(migVersion);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    async exec() {
        await this.database.exec(initSql);
        this._initStatements();
        await this.migrate();
    }
}