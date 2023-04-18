import crypto from "crypto";
import Migrator from "./migrator.js";

class DatabaseManager {

    constructor(options) {
        this.options = options;
        this.prepared = {};
    }

    async init() {
        return await this.getMigrator().exec();
    }

    getMigrator(){
        return new Migrator(this);
    }

    createHash(sql) {
        const key = crypto
            .createHash("MD5")
            .update(sql)
            .digest('hex');
        return key;
    }

    updateSql(sql, params) {
        for (let param in params) {
            const value = params[param];
            const expr = new RegExp('\\$' + param, 'g');
            sql = sql.replace(expr, value);
        }
        return sql;
    }

    getStatement(sql, params) {

        sql = this.updateSql(sql, params);
        const key = this.createHash(sql);

        if (!this.prepared[key]) {
            this.prepared[key] = this.prepare(sql);
        }
        return this.prepared[key];
    }
}

export default DatabaseManager;