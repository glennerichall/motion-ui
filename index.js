const events = require('./src/events');

(async () => {
        await events.init();
        await events.migrate();
        await require('./src')();
    }
)();
