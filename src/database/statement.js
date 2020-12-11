module.exports = class Statement {
    constructor(sql, database) {
        this.database = database;
        this.sql = sql;
        this.name = this.database.createHash(sql);
    }

    getQuery(params = {}) {
        const {name} = this;
        const keys = Object.keys(params).sort();
        const values = keys.reduce((values, key) => {
            values.push(params[key]);
            return values;
        }, []);
        const text = keys.reduce((sql, key, index) => {
            const expr = new RegExp("@" + key, 'g');
            return sql.replace(expr, "$" + (index+1));
        }, this.sql);

        return {
            name,
            text,
            values
        };
    }

    async get(params) {
        const result = await this.database.query(this.getQuery(params));
        if(result.rowCount > 0) return result.rows[0];
        return null;
    }

    run(params) {
        return this.database.query(this.getQuery(params));
    }

    all(params) {
        return this.database.query(this.getQuery(params));
    }
};