const Builder = require("./builder");
const Database = require('../database');
const options = {
    name: process.env.EVENTS || './motion.db'
};

class Events extends Database {
    constructor(options) {
        options = options || {};
        super({
            readonly: true,
            ...options
        });
    }

    getBuilder(options = {}) {
        return new Builder(this);
    }
}

module.exports = new Events(options);