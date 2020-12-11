const Database = require('./database');
const Statement = require('./statement');

const {Client} = require('pg');

module.exports = class DatabasePostgres extends Database {
    constructor(options) {
        super(options);
    }

    async init() {
        this.client = new Client(this.options);
        await this.client.connect();
        await super.init();
    }

    prepare(sql) {
        return new Statement(sql, this);
    }

    async query(query) {
        try {
            return (await this.client.query(query)).rows;
        }catch (e){
            console.log(query);
            console.log(e.stack);
        }
    }

    exec(sql) {
        return this.query(sql);
    }

    async close() {
        this.client.end();
        return this;
    }

}