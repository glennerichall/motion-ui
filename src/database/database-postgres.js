import Database from "./database.js";

import PG from 'pg';

const {Client} = PG;
import Statement from "./statement.js";


export default class DatabasePostgres extends Database {
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
            const result = await this.client.query(query);
            return result.rows;
        } catch (e) {
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