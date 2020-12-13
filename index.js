const database = require('./src/database');

(async () => {
        await database.init();
        await require('./src')();
    }
)();
