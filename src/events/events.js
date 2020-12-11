const Builder = require("./builder");
const databaseConfigs = require(process.env.DATABASE_CONFIGS || '../../pgconfig.json');
const Database = require(`../database/database-${databaseConfigs.type}`);

class Events extends Database {
    constructor() {
        super(databaseConfigs.options);
    }

    getBuilder() {
        return new Builder(this);
    }
}

module.exports = new Events();