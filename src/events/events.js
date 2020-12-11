const Builder = require("./builder");
var path = require('path');

let configs = process.env.DATABASE_CONFIGS ?? 'pgconfig.json';

if(configs) {
    if(!path.isAbsolute(process.env.DATABASE_CONFIGS)) {
        configs = path.join(__dirname, '../..', configs);
    }
}
const databaseConfigs = require(configs);
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