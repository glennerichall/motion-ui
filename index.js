const events = require('./src/events/events');

(async () => {
        await events.init();
        await require('./src')();
    }
)();
