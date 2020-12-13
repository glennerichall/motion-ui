const Builder = require("../events/builder");
var path = require('path');

let configs = process.env.DATABASE_CONFIGS ?? 'pgconfig.json';

if (!path.isAbsolute(configs)) {
    configs = path.join(__dirname, '../..', configs);
}
const databaseConfigs = require(configs);
const Database = require(`./database-${databaseConfigs.type}`);

class Index extends Database {
    constructor() {
        super(databaseConfigs.options);
    }

    getBuilder() {
        return new Builder(this);
    }
}

module.exports = new Index();